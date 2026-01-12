import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { requireAuth, requirePermission } from '@/lib/auth';
import { createMeetingSchema } from '@/lib/validation';

// GET /api/meetings - List meetings
export async function GET(request) {
    try {
        const user = await requireAuth(request);
        const { searchParams } = new URL(request.url);

        const projectId = searchParams.get('projectId');

        let whereClause = {};
        if (projectId) whereClause.projectId = projectId;

        const meetings = await prisma.meeting.findMany({
            where: whereClause,
            include: {
                organizer: {
                    select: {
                        name: true,
                    },
                },
                _count: {
                    select: {
                        attachments: true,
                        actionItems: true,
                    },
                },
            },
            orderBy: {
                date: 'desc',
            },
        });

        return NextResponse.json({ meetings });

    } catch (error) {
        console.error('Get meetings error:', error);
        return NextResponse.json(
            { error: error.message || 'Erreur lors de la récupération des réunions' },
            { status: 500 }
        );
    }
}

// POST /api/meetings - Create meeting
export async function POST(request) {
    try {
        const user = await requirePermission(request, 'CREATE_MEETING');
        const body = await request.json();

        // Validate input
        const validated = createMeetingSchema.parse(body);

        // Create meeting
        const meeting = await prisma.meeting.create({
            data: {
                ...validated,
                organizerId: user.id,
            },
        });

        // Log activity
        await prisma.activityLog.create({
            data: {
                projectId: validated.projectId,
                type: 'MEETING_CREATED',
                description: `Réunion "${meeting.title}" planifiée`,
                userId: user.id,
            },
        });

        return NextResponse.json({ meeting }, { status: 201 });

    } catch (error) {
        console.error('Create meeting error:', error);
        return NextResponse.json(
            { error: error.message || 'Erreur lors de la création de la réunion' },
            { status: 500 }
        );
    }
}
