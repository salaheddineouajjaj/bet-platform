import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { requireAuth } from '@/lib/auth';

// GET /api/documents/[id] - Get document details with download URL
export async function GET(request, { params }) {
    try {
        const user = await requireAuth(request);
        const { id } = params;

        const document = await prisma.document.findUnique({
            where: { id },
            include: {
                uploadedBy: {
                    select: {
                        name: true,
                        email: true,
                    },
                },
                deliverable: {
                    select: {
                        name: true,
                    },
                },
                versions: {
                    orderBy: {
                        uploadedAt: 'desc',
                    },
                },
            },
        });

        if (!document) {
            return NextResponse.json(
                { error: 'Document non trouvé' },
                { status: 404 }
            );
        }

        return NextResponse.json({ document });

    } catch (error) {
        console.error('Get document error:', error);
        return NextResponse.json(
            { error: error.message || 'Erreur lors de la récupération du document' },
            { status: 500 }
        );
    }
}
