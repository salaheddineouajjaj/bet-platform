import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { supabase } from '@/lib/supabase';

// GET /api/auth/sync-user - Sync authenticated user to database
export async function GET(request) {
    try {
        // Get session from Supabase
        const authHeader = request.headers.get('authorization');
        if (!authHeader) {
            return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
        }

        const token = authHeader.replace('Bearer ', '');
        const { data: { user: authUser }, error } = await supabase.auth.getUser(token);

        if (error || !authUser) {
            return NextResponse.json({ error: 'Session invalide' }, { status: 401 });
        }

        console.log('[SYNC] Checking user:', authUser.email);

        // Check if user exists in database
        let user = await prisma.user.findUnique({
            where: { email: authUser.email },
        });

        if (!user) {
            console.log('[SYNC] User not found, creating:', authUser.email);

            // Create user with default role CONTRIBUTEUR
            user = await prisma.user.create({
                data: {
                    email: authUser.email,
                    name: authUser.user_metadata?.full_name || authUser.email.split('@')[0],
                    role: 'CONTRIBUTEUR', // Default role
                    lot: null,
                },
            });

            console.log('[SYNC] User created:', user.id, user.email, user.role);
        } else {
            console.log('[SYNC] User exists:', user.id, user.email, user.role);
        }

        return NextResponse.json({
            success: true,
            user: {
                id: user.id,
                email: user.email,
                name: user.name,
                role: user.role,
                lot: user.lot,
            },
        });

    } catch (error) {
        console.error('[SYNC] Error:', error);
        return NextResponse.json(
            { error: error.message || 'Erreur lors de la synchronisation' },
            { status: 500 }
        );
    }
}
