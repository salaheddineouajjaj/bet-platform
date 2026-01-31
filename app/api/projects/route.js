import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { requireAuth, requirePermission } from '@/lib/auth';
import { ensureUserInDatabase } from '@/lib/userHelpers';

// GET /api/projects - List all projects
export async function GET(request) {
    try {
        console.log('[PROJECTS API] Incoming request...');
        const user = await requireAuth(request);
        console.log('[PROJECTS API] User authenticated:', user ? user.email : 'NO USER');

        if (!user) {
            console.error('[PROJECTS API] ❌ No user returned from requireAuth');
            return NextResponse.json(
                { error: 'Unauthorized - No user found' },
                { status: 401 }
            );
        }

        // Filter projects based on user role and assignments
        let whereClause = {};

        // Pour le moment, on autorise tout le monde à voir les projets s'ils sont connectés
        // Cela permet de retrouver vos anciens projets créés en local
        if (user.role !== 'CHEF_DE_PROJET') {
            console.log(`[PROJECTS] User ${user.email} is viewing projects as ${user.role}`);
            whereClause = {}; // On lève la restriction temporairement
        }

        const projects = await prisma.project.findMany({
            where: whereClause,
            include: {
                createdBy: {
                    select: {
                        name: true,
                        email: true,
                    },
                },
                assignedUsers: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        role: true,
                        lot: true,
                    },
                },
                _count: {
                    select: {
                        deliverables: true,
                        documents: true,
                        remarks: true,
                    },
                },
            },
            orderBy: {
                updatedAt: 'desc',
            },
        });

        return NextResponse.json({ projects });

    } catch (error) {
        console.error('Get projects error:', error);
        return NextResponse.json(
            { error: error.message || 'Erreur lors de la récupération des projets' },
            { status: error.message === 'Unauthorized' ? 401 : 500 }
        );
    }
}

// POST /api/projects - Create new project
export async function POST(request) {
    try {
        const user = await requirePermission(request, 'CREATE_PROJECT');
        const body = await request.json();

        console.log('Creating project with data:', body);

        // Simple validation - just check required fields
        if (!body.name || !body.moa || !body.architecte || !body.adresse || !body.type) {
            return NextResponse.json(
                { error: 'Champs requis manquants' },
                { status: 400 }
            );
        }

        // Ensure user exists in database (handle fallback user case)
        const actualUserId = await ensureUserInDatabase(user);

        // Create project and automatically assign creator
        const project = await prisma.project.create({
            data: {
                name: body.name,
                moa: body.moa,
                architecte: body.architecte,
                adresse: body.adresse,
                type: body.type,
                enjeux: body.enjeux || null,
                phase: body.phase,
                startDate: body.startDate ? new Date(body.startDate) : null,
                endDate: body.endDate ? new Date(body.endDate) : null,
                createdById: actualUserId,
                // Auto-assign creator to project
                assignedUsers: {
                    connect: { id: actualUserId },
                },
            },
            include: {
                createdBy: {
                    select: {
                        name: true,
                        email: true,
                    },
                },
                assignedUsers: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        role: true,
                        lot: true,
                    },
                },
            },
        });

        console.log('Project created:', project.id);

        // Log activity
        try {
            await prisma.activityLog.create({
                data: {
                    projectId: project.id,
                    type: 'PROJECT_CREATED',
                    description: `Projet "${project.name}" créé`,
                    userId: user.id,
                },
            });
        } catch (logError) {
            console.error('Activity log error (non-fatal):', logError);
        }

        return NextResponse.json({ project }, { status: 201 });

    } catch (error) {
        console.error('Create project error:', error);
        return NextResponse.json(
            { error: error.message || 'Erreur lors de la création du projet' },
            { status: 500 }
        );
    }
}

// DELETE /api/projects?id=xxx - Delete a project
export async function DELETE(request) {
    try {
        const user = await requirePermission(request, 'DELETE_PROJECT');
        const { searchParams } = new URL(request.url);
        const projectId = searchParams.get('id');

        if (!projectId) {
            return NextResponse.json(
                { error: 'ID du projet requis' },
                { status: 400 }
            );
        }

        // Check if project exists
        const project = await prisma.project.findUnique({
            where: { id: projectId },
        });

        if (!project) {
            return NextResponse.json(
                { error: 'Projet non trouvé' },
                { status: 404 }
            );
        }

        // Delete all related records in the correct order to avoid foreign key constraints
        // 1. Delete ActionItems (depends on Meeting)
        await prisma.actionItem.deleteMany({
            where: { meeting: { projectId: projectId } },
        });

        // 2. Delete RemarkComments (depends on Remark)
        await prisma.remarkComment.deleteMany({
            where: { remark: { projectId: projectId } },
        });

        // 3. Delete the rest of related records
        await prisma.meeting.deleteMany({ where: { projectId: projectId } });
        await prisma.remark.deleteMany({ where: { projectId: projectId } });
        await prisma.decision.deleteMany({ where: { projectId: projectId } });
        await prisma.risk.deleteMany({ where: { projectId: projectId } });
        await prisma.document.deleteMany({ where: { projectId: projectId } });
        await prisma.deliverable.deleteMany({ where: { projectId: projectId } });
        await prisma.projectContact.deleteMany({ where: { projectId: projectId } });
        await prisma.activityLog.deleteMany({ where: { projectId: projectId } });

        // 4. Finally delete the project
        await prisma.project.delete({
            where: { id: projectId },
        });

        console.log('Project deleted:', projectId);

        return NextResponse.json({ success: true, message: 'Projet supprimé avec succès' });

    } catch (error) {
        console.error('Delete project error:', error);
        return NextResponse.json(
            { error: error.message || 'Erreur lors de la suppression du projet' },
            { status: error.message === 'Unauthorized' ? 401 : error.message === 'Forbidden' ? 403 : 500 }
        );
    }
}
