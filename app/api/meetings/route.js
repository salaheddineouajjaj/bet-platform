import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { requireAuth, requirePermission } from '@/lib/auth';

// POST /api/meetings - Create new meeting
export async function POST(request) {
    try {
        const user = await requirePermission(request, 'CREATE_MEETING');
        const body = await request.json();

        const meeting = await prisma.meeting.create({
            data: {
                projectId: body.projectId,
                title: body.title,
                date: new Date(body.date),
                participants: body.participants,
                crContent: body.crContent,
                organizerId: user.id,
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
