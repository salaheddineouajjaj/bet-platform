import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { requireAuth } from '@/lib/auth';

// GET /api/projects/[id] - Get single project
export async function GET(request, context) {
    try {
        const user = await requireAuth(request);
        const { id } = await context.params; // Await params in Next.js 16

        const project = await prisma.project.findUnique({
            where: { id },
            include: {
                createdBy: {
                    select: { name: true, email: true },
                },
                contacts: true,
                risks: {
                    where: { status: { in: ['OPEN', 'MITIGATING'] } },
                    orderBy: { createdAt: 'desc' },
                },
                deliverables: {
                    where: {
                        status: { not: 'VALIDE' },
                        dueDate: { lt: new Date() }
                    },
                },
                _count: {
                    select: {
                        deliverables: true,
                        documents: true,
                        remarks: true,
                        meetings: true,
                        decisions: true,
                        risks: true,
                    },
                },
            },
        });

        if (!project) {
            return NextResponse.json(
                { error: 'Projet non trouvé' },
                { status: 404 }
            );
        }

        return NextResponse.json({ project });

    } catch (error) {
        console.error('Get project error:', error);
        return NextResponse.json(
            { error: error.message || 'Erreur' },
            { status: 500 }
        );
    }
}
