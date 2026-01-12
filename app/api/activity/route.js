import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { requireAuth } from '@/lib/auth';

// GET /api/activity - Get activity timeline
export async function GET(request) {
    try {
        const user = await requireAuth(request);
        const { searchParams } = new URL(request.url);

        const projectId = searchParams.get('projectId');
        const type = searchParams.get('type');
        const limit = parseInt(searchParams.get('limit')) || 50;

        let whereClause = {};
        if (projectId) whereClause.projectId = projectId;
        if (type) whereClause.type = type;

        const activities = await prisma.activityLog.findMany({
            where: whereClause,
            include: {
                user: {
                    select: {
                        name: true,
                    },
                },
                project: {
                    select: {
                        name: true,
                    },
                },
            },
            orderBy: {
                createdAt: 'desc',
            },
            take: limit,
        });

        return NextResponse.json({ activities });

    } catch (error) {
        console.error('Get activity error:', error);
        return NextResponse.json(
            { error: error.message || 'Erreur lors de la récupération de l\'activité' },
            { status: 500 }
        );
    }
}
