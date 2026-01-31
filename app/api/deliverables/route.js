import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { requireAuth, requirePermission } from '@/lib/auth';
import { ensureUserInDatabase } from '@/lib/userHelpers';

// GET /api/deliverables?projectId=xxx
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

        const deliverables = await prisma.deliverable.findMany({
            where: { projectId },
            include: {
                createdBy: {
                    select: {
                        name: true,
                        email: true,
                    },
                },
            },
            orderBy: {
                dueDate: 'asc',
            },
        });

        return NextResponse.json({ deliverables });

    } catch (error) {
        console.error('Get deliverables error:', error);
        return NextResponse.json(
            { error: error.message || 'Erreur lors de la récupération' },
            { status: 500 }
        );
    }
}

// POST /api/deliverables - Create new deliverable
export async function POST(request) {
    try {
        const user = await requirePermission(request, 'CREATE_DELIVERABLE');
        const body = await request.json();

        console.log('Creating deliverable with data:', body);

        // Simple validation
        if (!body.projectId || !body.name || !body.lot || !body.phase || !body.responsable || !body.dueDate) {
            return NextResponse.json(
                { error: 'Champs requis manquants' },
                { status: 400 }
            );
        }

        // Ensure user exists in database
        const actualUserId = await ensureUserInDatabase(user);

        // Create deliverable
        const deliverable = await prisma.deliverable.create({
            data: {
                projectId: body.projectId,
                lot: body.lot,
                name: body.name,
                phase: body.phase,
                responsable: body.responsable,
                dueDate: new Date(body.dueDate),
                status: body.status || 'A_FAIRE',
                createdById: actualUserId,
            },
            include: {
                createdBy: {
                    select: {
                        name: true,
                        email: true,
                    },
                },
            },
        });

        console.log('Deliverable created:', deliverable.id);

        return NextResponse.json({ deliverable }, { status: 201 });

    } catch (error) {
        console.error('Create deliverable error:', error);
        return NextResponse.json(
            { error: error.message || 'Erreur lors de la création' },
            { status: 500 }
        );
    }
}

// PATCH /api/deliverables/[id] - Update deliverable status
export async function PATCH(request) {
    try {
        const user = await requireAuth(request);
        const body = await request.json();
        const { id, status } = body;

        if (!id || !status) {
            return NextResponse.json(
                { error: 'id et status requis' },
                { status: 400 }
            );
        }

        const deliverable = await prisma.deliverable.update({
            where: { id },
            data: { status },
            include: {
                createdBy: {
                    select: {
                        name: true,
                        email: true,
                    },
                },
            },
        });

        return NextResponse.json({ deliverable });

    } catch (error) {
        console.error('Update deliverable error:', error);
        return NextResponse.json(
            { error: error.message || 'Erreur lors de la mise à jour' },
            { status: 500 }
        );
    }
}
