import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { requireAuth, requirePermission } from '@/lib/auth';
import { updateProjectSchema } from '@/lib/validation';

// GET /api/projects/[id] - Get project details
export async function GET(request, { params }) {
    try {
        const user = await requireAuth(request);
        const { id } = params;

        const project = await prisma.project.findUnique({
            where: { id },
            include: {
                createdBy: {
                    select: {
                        name: true,
                        email: true,
                    },
                },
                contacts: true,
                phases: {
                    orderBy: {
                        startDate: 'asc',
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
            { error: error.message || 'Erreur lors de la récupération du projet' },
            { status: 500 }
        );
    }
}

// PUT /api/projects/[id] - Update project
export async function PUT(request, { params }) {
    try {
        const user = await requirePermission(request, 'UPDATE_PROJECT');
        const { id } = params;
        const body = await request.json();

        // Validate input
        const validated = updateProjectSchema.parse(body);

        // Update project
        const project = await prisma.project.update({
            where: { id },
            data: validated,
            include: {
                createdBy: {
                    select: {
                        name: true,
                        email: true,
                    },
                },
            },
        });

        return NextResponse.json({ project });

    } catch (error) {
        console.error('Update project error:', error);
        return NextResponse.json(
            { error: error.message || 'Erreur lors de la mise à jour du projet' },
            { status: 500 }
        );
    }
}

// DELETE /api/projects/[id] - Delete project
export async function DELETE(request, { params }) {
    try {
        const user = await requirePermission(request, 'DELETE_PROJECT');
        const { id } = params;

        await prisma.project.delete({
            where: { id },
        });

        return NextResponse.json({ message: 'Projet supprimé' });

    } catch (error) {
        console.error('Delete project error:', error);
        return NextResponse.json(
            { error: error.message || 'Erreur lors de la suppression du projet' },
            { status: 500 }
        );
    }
}
