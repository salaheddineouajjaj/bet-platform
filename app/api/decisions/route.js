import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { requireAuth, requirePermission } from '@/lib/auth';

// POST /api/decisions - Create new decision
export async function POST(request) {
    try {
        const user = await requirePermission(request, 'CREATE_DECISION');
        const body = await request.json();

        const decision = await prisma.decision.create({
            data: {
                projectId: body.projectId,
                type: body.type,
                title: body.title,
                description: body.description,
                impact: body.impact,
                isValidated: false,
                decidedById: user.id,
            },
        });

        return NextResponse.json({ decision }, { status: 201 });

    } catch (error) {
        console.error('Create decision error:', error);
        return NextResponse.json(
            { error: error.message || 'Erreur lors de la création' },
            { status: 500 }
        );
    }
}
