import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { requireAuth } from '@/lib/auth';
import { updateRemarkSchema, createRemarkCommentSchema } from '@/lib/validation';

// GET /api/remarks/[id] - Get remark details with comments
export async function GET(request, { params }) {
    try {
        const user = await requireAuth(request);
        const { id } = params;

        const remark = await prisma.remark.findUnique({
            where: { id },
            include: {
                createdBy: {
                    select: {
                        name: true,
                        email: true,
                    },
                },
                responsable: {
                    select: {
                        name: true,
                        email: true,
                    },
                },
                document: {
                    select: {
                        filename: true,
                        path: true,
                        lot: true,
                    },
                },
                comments: {
                    include: {
                        author: {
                            select: {
                                name: true,
                                email: true,
                            },
                        },
                    },
                    orderBy: {
                        createdAt: 'asc',
                    },
                },
            },
        });

        if (!remark) {
            return NextResponse.json(
                { error: 'Remarque non trouvée' },
                { status: 404 }
            );
        }

        return NextResponse.json({ remark });

    } catch (error) {
        console.error('Get remark error:', error);
        return NextResponse.json(
            { error: error.message || 'Erreur lors de la récupération de la remarque' },
            { status: 500 }
        );
    }
}

// PUT /api/remarks/[id] - Update remark
export async function PUT(request, { params }) {
    try {
        const user = await requireAuth(request);
        const { id } = params;
        const body = await request.json();

        // Validate input
        const validated = updateRemarkSchema.parse(body);

        // Get current remark
        const currentRemark = await prisma.remark.findUnique({
            where: { id },
        });

        if (!currentRemark) {
            return NextResponse.json(
                { error: 'Remarque non trouvée' },
                { status: 404 }
            );
        }

        // Update remark
        const remark = await prisma.remark.update({
            where: { id },
            data: validated,
        });

        // Log status change
        if (validated.status && validated.status !== currentRemark.status) {
            await prisma.activityLog.create({
                data: {
                    projectId: remark.projectId,
                    type: 'REMARK_STATUS_CHANGED',
                    description: `Remarque "${remark.title}" → ${validated.status}`,
                    userId: user.id,
                },
            });
        }

        return NextResponse.json({ remark });

    } catch (error) {
        console.error('Update remark error:', error);
        return NextResponse.json(
            { error: error.message || 'Erreur lors de la mise à jour de la remarque' },
            { status: 500 }
        );
    }
}
