import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { requireAuth, requirePermission } from '@/lib/auth';
import { createRiskSchema, updateRiskSchema } from '@/lib/validation';

// GET /api/risks - List risks
export async function GET(request) {
    try {
        const user = await requireAuth(request);
        const { searchParams } = new URL(request.url);

        const projectId = searchParams.get('projectId');
        const impactType = searchParams.get('impactType');
        const status = searchParams.get('status');

        let whereClause = {};
        if (projectId) whereClause.projectId = projectId;
        if (impactType) whereClause.impactType = impactType;
        if (status) whereClause.status = status;

        const risks = await prisma.risk.findMany({
            where: whereClause,
            include: {
                createdBy: {
                    select: {
                        name: true,
                    },
                },
                responsable: {
                    select: {
                        name: true,
                    },
                },
            },
            orderBy: [
                { status: 'asc' },
                { impactType: 'desc' },
            ],
        });

        return NextResponse.json({ risks });

    } catch (error) {
        console.error('Get risks error:', error);
        return NextResponse.json(
            { error: error.message || 'Erreur lors de la récupération des risques' },
            { status: 500 }
        );
    }
}

// POST /api/risks - Create risk
export async function POST(request) {
    try {
        const user = await requirePermission(request, 'CREATE_RISK');
        const body = await request.json();

        // Validate input
        const validated = createRiskSchema.parse(body);

        // Create risk
        const risk = await prisma.risk.create({
            data: {
                ...validated,
                createdById: user.id,
            },
            include: {
                responsable: {
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
                type: 'RISK_CREATED',
                description: `Risque "${risk.title}" identifié (${risk.impactType})`,
                userId: user.id,
            },
        });

        return NextResponse.json({ risk }, { status: 201 });

    } catch (error) {
        console.error('Create risk error:', error);
        return NextResponse.json(
            { error: error.message || 'Erreur lors de la création du risque' },
            { status: 500 }
        );
    }
}
