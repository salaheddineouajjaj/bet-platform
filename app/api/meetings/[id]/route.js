import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { requireAuth } from '@/lib/auth';

// GET /api/meetings/[id] - Get meeting details
export async function GET(request, { params }) {
    try {
        const user = await requireAuth(request);
        const { id } = params;

        const meeting = await prisma.meeting.findUnique({
            where: { id },
            include: {
                organizer: {
                    select: {
                        name: true,
                        email: true,
                    },
                },
                attachments: true,
                actionItems: {
                    include: {
                        assignedTo: {
                            select: {
                                name: true,
                            },
                        },
                    },
                },
            },
        });

        if (!meeting) {
            return NextResponse.json(
                { error: 'Réunion non trouvée' },
                { status: 404 }
            );
        }

        return NextResponse.json({ meeting });

    } catch (error) {
        console.error('Get meeting error:', error);
        return NextResponse.json(
            { error: error.message || 'Erreur lors de la récupération de la réunion' },
            { status: 500 }
        );
    }
}
