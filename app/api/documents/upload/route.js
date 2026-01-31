import { NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { createClient } from '@supabase/supabase-js';
import prisma from '@/lib/prisma';
import { ensureUserInDatabase } from '@/lib/userHelpers';

// Initialize Supabase client with service role for storage
const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

// POST /api/documents/upload - Upload a document file
export async function POST(request) {
    try {
        const user = await requireAuth(request);
        const formData = await request.formData();

        const file = formData.get('file');
        const projectId = formData.get('projectId');
        const path = formData.get('path'); // e.g., '01_APS'
        const lot = formData.get('lot');
        const title = formData.get('title');
        const version = formData.get('version') || '1.0';

        if (!file || !projectId || !path || !lot) {
            return NextResponse.json(
                { error: 'Fichier, projet, chemin et lot sont requis' },
                { status: 400 }
            );
        }

        // Generate unique filename
        const fileExt = file.name.split('.').pop();
        const fileName = `${Date.now()}_${file.name}`;
        const filePath = `projects/${projectId}/${path}/${fileName}`;

        console.log('Uploading file:', filePath);

        // Upload to Supabase Storage
        const { data: uploadData, error: uploadError } = await supabaseAdmin.storage
            .from('documents')
            .upload(filePath, file, {
                contentType: file.type,
                upsert: false,
            });

        if (uploadError) {
            console.error('Upload error:', uploadError);
            return NextResponse.json(
                { error: 'Erreur lors de l\'upload: ' + uploadError.message },
                { status: 500 }
            );
        }

        // Get public URL
        const { data: { publicUrl } } = supabaseAdmin.storage
            .from('documents')
            .getPublicUrl(filePath);

        console.log('File uploaded, public URL:', publicUrl);

        // Ensure user exists in database
        const actualUserId = await ensureUserInDatabase(user);

        // Save document metadata to database
        const document = await prisma.document.create({
            data: {
                projectId,
                path,
                lot,
                filename: file.name,
                version,
                storageUrl: publicUrl,
                uploadedById: actualUserId,
            },
            include: {
                uploadedBy: {
                    select: {
                        name: true,
                        email: true,
                    },
                },
            },
        });

        console.log('Document metadata saved:', document.id);

        return NextResponse.json({
            document: {
                ...document,
                title: title || file.name,
            },
        }, { status: 201 });

    } catch (error) {
        console.error('Upload document error:', error);
        return NextResponse.json(
            { error: error.message || 'Erreur lors de l\'upload du document' },
            { status: 500 }
        );
    }
}

// DELETE /api/documents/upload?id=xxx - Delete a document
export async function DELETE(request) {
    try {
        const user = await requireAuth(request);
        const { searchParams } = new URL(request.url);
        const documentId = searchParams.get('id');

        if (!documentId) {
            return NextResponse.json(
                { error: 'ID du document requis' },
                { status: 400 }
            );
        }

        // Get document info
        const document = await prisma.document.findUnique({
            where: { id: documentId },
        });

        if (!document) {
            return NextResponse.json(
                { error: 'Document non trouvé' },
                { status: 404 }
            );
        }

        // Extract file path from storage URL
        const urlParts = document.storageUrl.split('/documents/');
        const filePath = urlParts[1];

        // Delete from storage
        const { error: deleteError } = await supabaseAdmin.storage
            .from('documents')
            .remove([filePath]);

        if (deleteError) {
            console.error('Storage delete error:', deleteError);
        }

        // Delete from database
        await prisma.document.delete({
            where: { id: documentId },
        });

        console.log('Document deleted:', documentId);

        return NextResponse.json({ success: true });

    } catch (error) {
        console.error('Delete document error:', error);
        return NextResponse.json(
            { error: error.message || 'Erreur lors de la suppression' },
            { status: 500 }
        );
    }
}
