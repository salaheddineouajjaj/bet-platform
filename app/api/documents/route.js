import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { requireAuth, canEditLot } from '@/lib/auth';
import { supabase } from '@/lib/supabase';

// GET /api/documents - List documents
export async function GET(request) {
    try {
        const user = await requireAuth(request);
        const { searchParams } = new URL(request.url);

        const projectId = searchParams.get('projectId');
        const path = searchParams.get('path');
        const lot = searchParams.get('lot');
        const deliverableId = searchParams.get('deliverableId');

        let whereClause = {};

        if (projectId) whereClause.projectId = projectId;
        if (path) whereClause.path = path;
        if (lot) whereClause.lot = lot;
        if (deliverableId) whereClause.deliverableId = deliverableId;

        const documents = await prisma.document.findMany({
            where: whereClause,
            include: {
                uploadedBy: {
                    select: {
                        name: true,
                    },
                },
                deliverable: {
                    select: {
                        name: true,
                    },
                },
                _count: {
                    select: {
                        versions: true,
                    },
                },
            },
            orderBy: {
                uploadedAt: 'desc',
            },
        });

        return NextResponse.json({ documents });

    } catch (error) {
        console.error('Get documents error:', error);
        return NextResponse.json(
            { error: error.message || 'Erreur lors de la récupération des documents' },
            { status: 500 }
        );
    }
}

// POST /api/documents - Upload document
export async function POST(request) {
    try {
        const user = await requireAuth(request);
        const formData = await request.formData();

        const file = formData.get('file');
        const projectId = formData.get('projectId');
        const deliverableId = formData.get('deliverableId');
        const path = formData.get('path');
        const lot = formData.get('lot');

        if (!file) {
            return NextResponse.json(
                { error: 'Fichier requis' },
                { status: 400 }
            );
        }

        // Check lot access
        if (!canEditLot(user, lot)) {
            return NextResponse.json(
                { error: 'Accès non autorisé à ce lot' },
                { status: 403 }
            );
        }

        // Upload to Supabase Storage
        const fileName = `${Date.now()}_${file.name}`;
        const filePath = `${projectId}/${path}/${lot}/${fileName}`;

        const { data: uploadData, error: uploadError } = await supabase.storage
            .from('documents')
            .upload(filePath, file);

        if (uploadError) {
            console.error('Upload error:', uploadError);
            return NextResponse.json(
                { error: 'Erreur lors du téléchargement du fichier' },
                { status: 500 }
            );
        }

        // Get public URL
        const { data: { publicUrl } } = supabase.storage
            .from('documents')
            .getPublicUrl(filePath);

        // Check if document exists (for versioning)
        const existingDoc = await prisma.document.findFirst({
            where: {
                projectId,
                path,
                lot,
                filename: file.name,
            },
        });

        let document;

        if (existingDoc) {
            // Create new version
            const currentVersion = parseFloat(existingDoc.version);
            const newVersion = (currentVersion + 0.1).toFixed(1);

            // Save old version
            await prisma.documentVersion.create({
                data: {
                    documentId: existingDoc.id,
                    version: existingDoc.version,
                    storageUrl: existingDoc.storageUrl,
                    uploadedBy: existingDoc.uploadedById,
                },
            });

            // Update document
            document = await prisma.document.update({
                where: { id: existingDoc.id },
                data: {
                    version: newVersion,
                    storageUrl: publicUrl,
                    uploadedById: user.id,
                    uploadedAt: new Date(),
                },
            });
        } else {
            // Create new document
            document = await prisma.document.create({
                data: {
                    projectId,
                    deliverableId: deliverableId || null,
                    path,
                    lot,
                    filename: file.name,
                    version: '1.0',
                    storageUrl: publicUrl,
                    uploadedById: user.id,
                },
            });
        }

        // Log activity
        await prisma.activityLog.create({
            data: {
                projectId,
                type: 'DOCUMENT_UPLOADED',
                description: `Document "${file.name}" déposé (${lot} - ${path})`,
                userId: user.id,
            },
        });

        return NextResponse.json({ document }, { status: 201 });

    } catch (error) {
        console.error('Upload document error:', error);
        return NextResponse.json(
            { error: error.message || 'Erreur lors du téléchargement du document' },
            { status: 500 }
        );
    }
}
