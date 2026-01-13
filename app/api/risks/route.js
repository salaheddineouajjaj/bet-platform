import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { requireAuth, requirePermission } from '@/lib/auth';

// POST /api/risks - Create new risk
export async function POST(request) {
    try {
        const user = await requirePermission(request, 'CREATE_RISK');
        const body = await request.json();

        const risk = await prisma.risk.create({
            data: {
                projectId: body.projectId,
                title: body.title,
                description: body.description,
                impactType: body.impactType,
                impactValue: body.impactValue,
                mitigation: body.mitigation,
                status: 'OPEN',
                createdById: user.id,
                responsableId: user.id,
            },
        });

        return NextResponse.json({ risk }, { status: 201 });

    } catch (error) {
        console.error('Create risk error:', error);
        return NextResponse.json(
            { error: error.message || 'Erreur lors de la création' },
            { status: 500 }
        );
    }
}
