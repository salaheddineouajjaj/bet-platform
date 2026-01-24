import { NextResponse } from 'next/server';
import { requirePermission } from '@/lib/auth';
import prisma from '@/lib/prisma';

// PATCH /api/projects/[id]/phase - Update project phase
export async function PATCH(request, { params }) {
    try {
        const user = await requirePermission(request, 'CREATE_PROJECT'); // Only Chef de Projet
        const { id: projectId } = await params;
        const { phase } = await request.json();

        if (!phase) {
            return NextResponse.json(
                { error: 'Phase requise' },
                { status: 400 }
            );
        }

        // Valid phases
        const validPhases = ['ESQUISSE', 'APS', 'APD', 'PRO', 'DCE', 'ACT', 'DET', 'AOR'];
        if (!validPhases.includes(phase)) {
            return NextResponse.json(
                { error: 'Phase invalide' },
                { status: 400 }
            );
        }

        // Get current project
        const currentProject = await prisma.project.findUnique({
            where: { id: projectId },
        });

        if (!currentProject) {
            return NextResponse.json(
                { error: 'Projet non trouvé' },
                { status: 404 }
            );
        }

        // Update project phase
        const project = await prisma.project.update({
            where: { id: projectId },
            data: { phase },
        });

        // Log activity
        const phaseLabels = {
            ESQUISSE: 'Esquisse',
            APS: 'APS - Avant-Projet Sommaire',
            APD: 'APD - Avant-Projet Définitif',
            PRO: 'PRO - Projet',
            DCE: 'DCE - Dossier de Consultation',
            ACT: 'ACT - Assistance Contrats',
            DET: 'DET - Direction Execution',
            AOR: 'AOR - Assistance Operations Reception',
        };

        await prisma.activityLog.create({
            data: {
                projectId,
                type: 'PHASE_CHANGED',
                description: `Phase changée: ${phaseLabels[currentProject.phase]} → ${phaseLabels[phase]}`,
                userId: user.id,
            },
        });

        console.log(`Project ${projectId} phase updated: ${currentProject.phase} → ${phase}`);

        return NextResponse.json({
            success: true,
            message: `Phase mise à jour: ${phaseLabels[phase]}`,
            project,
        });

    } catch (error) {
        console.error('Update project phase error:', error);
        return NextResponse.json(
            { error: error.message || 'Erreur lors de la mise à jour' },
            { status: 500 }
        );
    }
}
