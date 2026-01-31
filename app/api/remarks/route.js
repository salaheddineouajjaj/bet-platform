import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { requireAuth, requirePermission } from '@/lib/auth';
import { ensureUserInDatabase } from '@/lib/userHelpers';

// GET /api/remarks?projectId=xxx
export async function GET(request) {
    try {
        const user = await requireAuth(request);
        const { searchParams } = new URL(request.url);
        const projectId = searchParams.get('projectId');

        if (!projectId) {
            return NextResponse.json(
                { error: 'projectId requis' },
                { status: 400 }
            );
        }

        const remarks = await prisma.remark.findMany({
            where: { projectId },
            include: {
                createdBy: {
                    select: { name: true, email: true },
                },
                responsable: {
                    select: { name: true, email: true },
                },
                comments: {
                    include: {
                        author: {
                            select: { name: true, email: true },
                        },
                    },
                    orderBy: { createdAt: 'asc' },
                },
            },
            orderBy: { createdAt: 'desc' },
        });

        return NextResponse.json({ remarks });

    } catch (error) {
        console.error('Get remarks error:', error);
        return NextResponse.json(
            { error: error.message || 'Erreur lors de la récupération' },
            { status: 500 }
        );
    }
}

// POST /api/remarks - Create new remark
export async function POST(request) {
    try {
        const user = await requirePermission(request, 'CREATE_REMARK');
        const body = await request.json();

        console.log('Creating remark with data:', body);

        // Ensure user exists in database
        const actualUserId = await ensureUserInDatabase(user);

        const remark = await prisma.remark.create({
            data: {
                projectId: body.projectId,
                title: body.title,
                description: body.description,
                priority: body.priority || 'MOYENNE',
                status: 'OUVERT',
                responsableId: actualUserId,
                createdById: actualUserId,
                deadline: body.deadline ? new Date(body.deadline) : null,
            },
            include: {
                createdBy: {
                    select: { name: true, email: true },
                },
                responsable: {
                    select: { name: true, email: true },
                },
            },
        });

        return NextResponse.json({ remark }, { status: 201 });

    } catch (error) {
        console.error('Create remark error:', error);
        return NextResponse.json(
            { error: error.message || 'Erreur lors de la création' },
            { status: 500 }
        );
    }
}
