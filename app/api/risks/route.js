import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { requireAuth, requirePermission } from '@/lib/auth';

// GET /api/risks?projectId=xxx
export async function GET(request) {
    try {
        const user = await requireAuth(request);
        const { searchParams } = new URL(request.url);
        const projectId = searchParams.get('projectId');

        if (!projectId) {
            return NextResponse.json({ error: 'projectId requis' }, { status: 400 });
        }

        const risks = await prisma.risk.findMany({
            where: { projectId },
            orderBy: { createdAt: 'desc' },
            include: {
                responsable: {
                    select: { name: true, email: true }
                },
                createdBy: {
                    select: { name: true, email: true }
                }
            }
        });

        return NextResponse.json({ risks });
    } catch (error) {
        console.error('Get risks error:', error);
        return NextResponse.json({ error: 'Erreur récupération risques' }, { status: 500 });
    }
}

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
