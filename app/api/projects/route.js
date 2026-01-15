import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { requireAuth, requirePermission } from '@/lib/auth';

// GET /api/projects - List all projects
export async function GET(request) {
    try {
        const user = await requireAuth(request);

        // Filter projects based on user role
        let whereClause = {};

        if (user.role === 'REFERENT_LOT' || user.role === 'CONTRIBUTEUR') {
            // Only show projects where user has deliverables in their lot
            whereClause = {
                deliverables: {
                    some: {
                        lot: user.lot,
                    },
                },
            };
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

        // Create project
        const project = await prisma.project.create({
            data: {
                name: body.name,
                moa: body.moa,
                architecte: body.architecte,
                adresse: body.adresse,
                type: body.type,
                // enjeux: body.enjeux || null,
                phase: body.phase,
                // startDate: body.startDate ? new Date(body.startDate) : null,
                // endDate: body.endDate ? new Date(body.endDate) : null,
                createdById: user.id,
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
