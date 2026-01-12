import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { requireAuth } from '@/lib/auth';
import { createRemarkCommentSchema } from '@/lib/validation';

// POST /api/remarks/[id]/comments - Add comment to remark
export async function POST(request, { params }) {
    try {
        const user = await requireAuth(request);
        const { id } = params;
        const body = await request.json();

        // Validate input
        const validated = createRemarkCommentSchema.parse({
            ...body,
            remarkId: id,
        });

        // Create comment
        const comment = await prisma.remarkComment.create({
            data: {
                remarkId: id,
                content: validated.content,
                authorId: user.id,
            },
            include: {
                author: {
                    select: {
                        name: true,
                        email: true,
                    },
                },
            },
        });

        return NextResponse.json({ comment }, { status: 201 });

    } catch (error) {
        console.error('Create comment error:', error);
        return NextResponse.json(
            { error: error.message || 'Erreur lors de l\'ajout du commentaire' },
            { status: 500 }
        );
    }
}
