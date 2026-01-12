import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import prisma from '@/lib/prisma';
import { createUserSchema } from '@/lib/validation';

export async function POST(request) {
    try {
        const body = await request.json();

        // Validate input
        const validated = createUserSchema.parse(body);

        // Create auth user in Supabase
        const { data, error } = await supabase.auth.signUp({
            email: validated.email,
            password: validated.password,
        });

        if (error) {
            return NextResponse.json(
                { error: error.message },
                { status: 400 }
            );
        }

        // Create user in database
        const user = await prisma.user.create({
            data: {
                email: validated.email,
                name: validated.name,
                role: validated.role,
                lot: validated.lot,
            },
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
        }, { status: 201 });

    } catch (error) {
        console.error('Signup error:', error);
        return NextResponse.json(
            { error: 'Erreur lors de l\'inscription' },
            { status: 500 }
        );
    }
}
