import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { requireAuth, requirePermission } from '@/lib/auth';

// GET /api/decisions?projectId=xxx
export async function GET(request) {
    try {
        const user = await requireAuth(request);
        const { searchParams } = new URL(request.url);
        const projectId = searchParams.get('projectId');

        if (!projectId) {
            return NextResponse.json({ error: 'projectId requis' }, { status: 400 });
        }

        const decisions = await prisma.decision.findMany({
            where: { projectId },
            orderBy: { createdAt: 'desc' },
            include: {
                decidedBy: {
                    select: { name: true, email: true }
                }
            }
        });

        return NextResponse.json({ decisions });
    } catch (error) {
        console.error('Get decisions error:', error);
        return NextResponse.json({ error: 'Erreur récupération décisions' }, { status: 500 });
    }
}

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
