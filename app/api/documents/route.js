import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { requireAuth } from '@/lib/auth';

// GET /api/documents?projectId=xxx&path=xxx
export async function GET(request) {
    try {
        const user = await requireAuth(request);
        const { searchParams } = new URL(request.url);
        const projectId = searchParams.get('projectId');
        const path = searchParams.get('path');

        if (!projectId) {
            return NextResponse.json({ error: 'projectId requis' }, { status: 400 });
        }

        const where = { projectId };
        if (path) {
            where.path = path;
        }

        const documents = await prisma.document.findMany({
            where,
            orderBy: { uploadedAt: 'desc' },
            include: {
                uploadedBy: {
                    select: { name: true, email: true }
                }
            }
        });

        return NextResponse.json({ documents });
    } catch (error) {
        console.error('Get documents error:', error);
        return NextResponse.json({ error: 'Erreur récupération documents' }, { status: 500 });
    }
}
