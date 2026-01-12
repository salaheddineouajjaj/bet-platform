import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { requireAuth, requirePermission } from '@/lib/auth';
import { updateRiskSchema } from '@/lib/validation';

// GET /api/risks/[id] - Get risk details
export async function GET(request, { params }) {
    try {
        const user = await requireAuth(request);
        const { id } = params;

        const risk = await prisma.risk.findUnique({
            where: { id },
            include: {
                createdBy: {
                    select: {
                        name: true,
                        email: true,
                    },
                },
                responsable: {
                    select: {
                        name: true,
                        email: true,
                    },
                },
            },
        });

        if (!risk) {
            return NextResponse.json(
                { error: 'Risque non trouvé' },
                { status: 404 }
            );
        }

        return NextResponse.json({ risk });

    } catch (error) {
        console.error('Get risk error:', error);
        return NextResponse.json(
            { error: error.message || 'Erreur lors de la récupération du risque' },
            { status: 500 }
        );
    }
}

// PUT /api/risks/[id] - Update risk
export async function PUT(request, { params }) {
    try {
        const user = await requirePermission(request, 'UPDATE_RISK');
        const { id } = params;
        const body = await request.json();

        // Validate input
        const validated = updateRiskSchema.parse(body);

        // Get current risk
        const currentRisk = await prisma.risk.findUnique({
            where: { id },
        });

        if (!currentRisk) {
            return NextResponse.json(
                { error: 'Risque non trouvé' },
                { status: 404 }
            );
        }

        // Update risk
        const risk = await prisma.risk.update({
            where: { id },
            data: validated,
        });

        // Log status change
        if (validated.status && validated.status !== currentRisk.status) {
            await prisma.activityLog.create({
                data: {
                    projectId: risk.projectId,
                    type: 'RISK_STATUS_CHANGED',
                    description: `Risque "${risk.title}" → ${validated.status}`,
                    userId: user.id,
                },
            });
        }

        return NextResponse.json({ risk });

    } catch (error) {
        console.error('Update risk error:', error);
        return NextResponse.json(
            { error: error.message || 'Erreur lors de la mise à jour du risque' },
            { status: 500 }
        );
    }
}
