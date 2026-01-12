import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import prisma from '@/lib/prisma';
import { loginSchema } from '@/lib/validation';

export async function POST(request) {
    try {
        const body = await request.json();

        // Validate input
        const validated = loginSchema.parse(body);

        // Sign in with Supabase
        const { data, error } = await supabase.auth.signInWithPassword({
            email: validated.email,
            password: validated.password,
        });

        if (error) {
            return NextResponse.json(
                { error: 'Email ou mot de passe invalide' },
                { status: 401 }
            );
        }

        // Get user from database
        const user = await prisma.user.findUnique({
            where: { email: validated.email },
        });

        return NextResponse.json({
            user: {
                id: user.id,
                email: user.email,
                name: user.name,
                role: user.role,
                lot: user.lot,
            },
            session: data.session,
        });

    } catch (error) {
        console.error('Login error:', error);
        return NextResponse.json(
            { error: 'Erreur lors de la connexion' },
            { status: 500 }
        );
    }
}
