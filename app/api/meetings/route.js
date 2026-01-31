import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { requireAuth, requirePermission } from '@/lib/auth';
import { ensureUserInDatabase } from '@/lib/userHelpers';

// GET /api/meetings?projectId=xxx
export async function GET(request) {
    try {
        const user = await requireAuth(request);
        const { searchParams } = new URL(request.url);
        const projectId = searchParams.get('projectId');

        if (!projectId) {
            return NextResponse.json({ error: 'projectId requis' }, { status: 400 });
        }

        const meetings = await prisma.meeting.findMany({
            where: { projectId },
            orderBy: { date: 'desc' },
            include: {
                organizer: {
                    select: { name: true, email: true }
                },
                actionItems: {
                    include: {
                        assignedTo: {
                            select: { name: true, email: true }
                        }
                    },
                    orderBy: { createdAt: 'asc' }
                }
            }
        });

        return NextResponse.json({ meetings });
    } catch (error) {
        console.error('Get meetings error:', error);
        return NextResponse.json({ error: 'Erreur récupération réunions' }, { status: 500 });
    }
}

// POST /api/meetings - Create new meeting
export async function POST(request) {
    try {
        const user = await requirePermission(request, 'CREATE_MEETING');
        const body = await request.json();

        // Ensure user exists in database
        const actualUserId = await ensureUserInDatabase(user);

        const meeting = await prisma.meeting.create({
            data: {
                projectId: body.projectId,
                title: body.title,
                date: new Date(body.date),
                participants: body.participants,
                crContent: body.crContent,
                organizerId: actualUserId,
            },
        });

        return NextResponse.json({ meeting }, { status: 201 });

    } catch (error) {
        console.error('Create meeting error:', error);
        return NextResponse.json(
            { error: error.message || 'Erreur lors de la création' },
            { status: 500 }
        );
    }
}
