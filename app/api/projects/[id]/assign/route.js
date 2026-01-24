import { NextResponse } from 'next/server';
import { requirePermission } from '@/lib/auth';
import prisma from '@/lib/prisma';

// POST /api/projects/[id]/assign - Assign user to project
export async function POST(request, { params }) {
    try {
        console.log('[ASSIGN] Starting assignment process...');

        const user = await requirePermission(request, 'CREATE_PROJECT'); // Only admins
        console.log('[ASSIGN] User authenticated:', user.email);

        const { id: projectId } = await params;
        console.log('[ASSIGN] Project ID:', projectId);

        const { userId } = await request.json();
        console.log('[ASSIGN] User to assign ID:', userId);

        if (!userId) {
            console.log('[ASSIGN] Error: userId missing');
            return NextResponse.json(
                { error: 'userId requis' },
                { status: 400 }
            );
        }

        // Check if project exists
        console.log('[ASSIGN] Checking if project exists...');
        const project = await prisma.project.findUnique({
            where: { id: projectId },
        });

        if (!project) {
            console.log('[ASSIGN] Error: Project not found');
            return NextResponse.json(
                { error: 'Projet non trouvé' },
                { status: 404 }
            );
        }
        console.log('[ASSIGN] Project found:', project.name);

        // Check if user exists
        console.log('[ASSIGN] Checking if user to assign exists...');
        const userToAssign = await prisma.user.findUnique({
            where: { id: userId },
        });

        if (!userToAssign) {
            console.log('[ASSIGN] Error: User not found');
            return NextResponse.json(
                { error: 'Utilisateur non trouvé' },
                { status: 404 }
            );
        }
        console.log('[ASSIGN] User to assign found:', userToAssign.name);

        // Assign user to project (add to many-to-many relation)
        console.log('[ASSIGN] Connecting user to project...');
        await prisma.project.update({
            where: { id: projectId },
            data: {
                assignedUsers: {
                    connect: { id: userId },
                },
            },
        });

        console.log(`[ASSIGN] SUCCESS: User ${userToAssign.name} assigned to project ${project.name}`);

        return NextResponse.json({
            success: true,
            message: `${userToAssign.name} assigné au projet`,
        });

    } catch (error) {
        console.error('[ASSIGN] ERROR:', error);
        return NextResponse.json(
            { error: error.message || 'Erreur lors de l\'assignation' },
            { status: 500 }
        );
    }
}

// DELETE /api/projects/[id]/assign?userId=xxx - Remove user from project
export async function DELETE(request, { params }) {
    try {
        const user = await requirePermission(request, 'CREATE_PROJECT'); // Only admins
        const { id: projectId } = await params;
        const { searchParams } = new URL(request.url);
        const userId = searchParams.get('userId');

        if (!userId) {
            return NextResponse.json(
                { error: 'userId requis' },
                { status: 400 }
            );
        }

        // Remove user from project
        await prisma.project.update({
            where: { id: projectId },
            data: {
                assignedUsers: {
                    disconnect: { id: userId },
                },
            },
        });

        console.log(`User removed from project ${projectId}`);

        return NextResponse.json({
            success: true,
            message: 'Utilisateur retiré du projet',
        });

    } catch (error) {
        console.error('Remove user from project error:', error);
        return NextResponse.json(
            { error: error.message || 'Erreur lors du retrait' },
            { status: 500 }
        );
    }
}
