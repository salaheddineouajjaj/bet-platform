import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { requireAuth, canAccessLot } from '@/lib/auth';
import { createDeliverableSchema } from '@/lib/validation';

// GET /api/deliverables - List deliverables
export async function GET(request) {
    try {
        const user = await requireAuth(request);
        const { searchParams } = new URL(request.url);

        const projectId = searchParams.get('projectId');
        const lot = searchParams.get('lot');
        const phase = searchParams.get('phase');
        const status = searchParams.get('status');

        // Build where clause
        let whereClause = {};

        if (projectId) {
            whereClause.projectId = projectId;
        }

        if (lot) {
            whereClause.lot = lot;
        }

        if (phase) {
            whereClause.phase = phase;
        }

        if (status) {
            whereClause.status = status;
        }

        // Filter by user lot if not admin
        if (user.role === 'REFERENT_LOT' || user.role === 'CONTRIBUTEUR') {
            whereClause.lot = user.lot;
        }

        const deliverables = await prisma.deliverable.findMany({
            where: whereClause,
            include: {
                project: {
                    select: {
                        name: true,
                    },
                },
                createdBy: {
                    select: {
                        name: true,
                    },
                },
                _count: {
                    select: {
                        documents: true,
                    },
                },
            },
            orderBy: {
                dueDate: 'asc',
            },
        });

        return NextResponse.json({ deliverables });

    } catch (error) {
        console.error('Get deliverables error:', error);
        return NextResponse.json(
            { error: error.message || 'Erreur lors de la récupération des livrables' },
            { status: 500 }
        );
    }
}

// POST /api/deliverables - Create deliverable
export async function POST(request) {
    try {
        const user = await requireAuth(request);
        const body = await request.json();

        // Validate input
        const validated = createDeliverableSchema.parse(body);

        // Check lot access
        if (!canAccessLot(user, validated.lot)) {
            return NextResponse.json(
                { error: 'Accès non autorisé à ce lot' },
                { status: 403 }
            );
        }

        // Create deliverable
        const deliverable = await prisma.deliverable.create({
            data: {
                ...validated,
                createdById: user.id,
            },
            include: {
                project: {
                    select: {
                        name: true,
                    },
                },
            },
        });

        // Log activity
        await prisma.activityLog.create({
            data: {
                projectId: validated.projectId,
                type: 'DELIVERABLE_CREATED',
                description: `Livrable "${deliverable.name}" créé (${deliverable.lot})`,
                userId: user.id,
            },
        });

        return NextResponse.json({ deliverable }, { status: 201 });

    } catch (error) {
        console.error('Create deliverable error:', error);
        return NextResponse.json(
            { error: error.message || 'Erreur lors de la création du livrable' },
            { status: 500 }
        );
    }
}
