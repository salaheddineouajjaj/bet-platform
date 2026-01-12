import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function POST(request) {
    try {
        const { error } = await supabase.auth.signOut();

        if (error) {
            return NextResponse.json(
                { error: error.message },
                { status: 400 }
            );
        }

        return NextResponse.json({ message: 'Déconnexion réussie' });

    } catch (error) {
        console.error('Logout error:', error);
        return NextResponse.json(
            { error: 'Erreur lors de la déconnexion' },
            { status: 500 }
        );
    }
}
