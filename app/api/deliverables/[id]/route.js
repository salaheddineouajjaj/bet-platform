import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { requireAuth } from '@/lib/auth';
import { hasPermission } from '@/lib/permissions';
import { updateDeliverableSchema } from '@/lib/validation';

// GET /api/deliverables/[id] - Get deliverable details
export async function GET(request, { params }) {
    try {
        const user = await requireAuth(request);
        const { id } = params;

        const deliverable = await prisma.deliverable.findUnique({
            where: { id },
            include: {
                project: true,
                createdBy: {
                    select: {
                        name: true,
                        email: true,
                    },
                },
                documents: true,
            },
        });

        if (!deliverable) {
            return NextResponse.json(
                { error: 'Livrable non trouvé' },
                { status: 404 }
            );
        }

        return NextResponse.json({ deliverable });

    } catch (error) {
        console.error('Get deliverable error:', error);
        return NextResponse.json(
            { error: error.message || 'Erreur lors de la récupération du livrable' },
            { status: 500 }
        );
    }
}

// PUT /api/deliverables/[id] - Update deliverable
export async function PUT(request, { params }) {
    try {
        const user = await requireAuth(request);
        const { id } = params;
        const body = await request.json();

        // Get current deliverable
        const currentDeliverable = await prisma.deliverable.findUnique({
            where: { id },
        });

        if (!currentDeliverable) {
            return NextResponse.json(
                { error: 'Livrable non trouvé' },
                { status: 404 }
            );
        }

        // Check permissions - Chef de projet can edit all, others only their lot
        const canEdit = user.role === 'CHEF_DE_PROJET' ||
            (user.lot && user.lot === currentDeliverable.lot);

        if (!canEdit) {
            return NextResponse.json(
                { error: 'Accès non autorisé à ce lot' },
                { status: 403 }
            );
        }

        // Validate input
        const validated = updateDeliverableSchema.parse(body);

        // Check if status change requires validation permission
        if (validated.status && ['VALIDE', 'REJETE'].includes(validated.status)) {
            if (!hasPermission(user.role, 'VALIDATE_DELIVERABLE')) {
                return NextResponse.json(
                    { error: 'Vous n\'avez pas la permission de valider des livrables' },
                    { status: 403 }
                );
            }
        }

        // Update deliverable
        const deliverable = await prisma.deliverable.update({
            where: { id },
            data: validated,
        });

        // Log status change
        if (validated.status && validated.status !== currentDeliverable.status) {
            await prisma.activityLog.create({
                data: {
                    projectId: deliverable.projectId,
                    type: 'DELIVERABLE_STATUS_CHANGED',
                    description: `Livrable "${deliverable.name}" → ${validated.status}`,
                    userId: user.id,
                },
            });
        }

        return NextResponse.json({ deliverable });

    } catch (error) {
        console.error('Update deliverable error:', error);
        return NextResponse.json(
            { error: error.message || 'Erreur lors de la mise à jour du livrable' },
            { status: 500 }
        );
    }
}
