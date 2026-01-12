import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { requireAuth } from '@/lib/auth';
import { createRemarkSchema } from '@/lib/validation';

// GET /api/remarks - List remarks
export async function GET(request) {
    try {
        const user = await requireAuth(request);
        const { searchParams } = new URL(request.url);

        const projectId = searchParams.get('projectId');
        const status = searchParams.get('status');
        const priority = searchParams.get('priority');
        const responsableId = searchParams.get('responsableId');

        let whereClause = {};

        if (projectId) whereClause.projectId = projectId;
        if (status) whereClause.status = status;
        if (priority) whereClause.priority = priority;
        if (responsableId) whereClause.responsableId = responsableId;

        const remarks = await prisma.remark.findMany({
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
                document: {
                    select: {
                        filename: true,
                    },
                },
                _count: {
                    select: {
                        comments: true,
                    },
                },
            },
            orderBy: [
                { priority: 'desc' },
                { deadline: 'asc' },
            ],
        });

        return NextResponse.json({ remarks });

    } catch (error) {
        console.error('Get remarks error:', error);
        return NextResponse.json(
            { error: error.message || 'Erreur lors de la récupération des remarques' },
            { status: 500 }
        );
    }
}

// POST /api/remarks - Create remark
export async function POST(request) {
    try {
        const user = await requireAuth(request);
        const body = await request.json();

        // Validate input
        const validated = createRemarkSchema.parse(body);

        // Create remark
        const remark = await prisma.remark.create({
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
                type: 'REMARK_CREATED',
                description: `Remarque "${remark.title}" ouverte (${remark.priority})`,
                userId: user.id,
            },
        });

        return NextResponse.json({ remark }, { status: 201 });

    } catch (error) {
        console.error('Create remark error:', error);
        return NextResponse.json(
            { error: error.message || 'Erreur lors de la création de la remarque' },
            { status: 500 }
        );
    }
}
