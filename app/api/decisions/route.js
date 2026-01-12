import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { requireAuth, requirePermission } from '@/lib/auth';
import { createDecisionSchema } from '@/lib/validation';

// GET /api/decisions - List decisions (immutable audit log)
export async function GET(request) {
    try {
        const user = await requireAuth(request);
        const { searchParams } = new URL(request.url);

        const projectId = searchParams.get('projectId');
        const type = searchParams.get('type');

        let whereClause = {};
        if (projectId) whereClause.projectId = projectId;
        if (type) whereClause.type = type;

        const decisions = await prisma.decision.findMany({
            where: whereClause,
            include: {
                decidedBy: {
                    select: {
                        name: true,
                        role: true,
                    },
                },
            },
            orderBy: {
                createdAt: 'desc',
            },
        });

        return NextResponse.json({ decisions });

    } catch (error) {
        console.error('Get decisions error:', error);
        return NextResponse.json(
            { error: error.message || 'Erreur lors de la récupération des décisions' },
            { status: 500 }
        );
    }
}

// POST /api/decisions - Create decision (immutable)
export async function POST(request) {
    try {
        const user = await requirePermission(request, 'CREATE_DECISION');
        const body = await request.json();

        // Validate input
        const validated = createDecisionSchema.parse(body);

        // Create decision
        const decision = await prisma.decision.create({
            data: {
                ...validated,
                decidedById: user.id,
            },
        });

        // Log activity
        await prisma.activityLog.create({
            data: {
                projectId: validated.projectId,
                type: 'DECISION_MADE',
                description: `Décision "${decision.title}" prise (${decision.type})`,
                userId: user.id,
            },
        });

        return NextResponse.json({ decision }, { status: 201 });

    } catch (error) {
        console.error('Create decision error:', error);
        return NextResponse.json(
            { error: error.message || 'Erreur lors de la création de la décision' },
            { status: 500 }
        );
    }
}
