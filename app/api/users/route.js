import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { requirePermission } from '@/lib/auth';
import { createClient } from '@supabase/supabase-js';

// Initialize Supabase Admin client for creating users
const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY,
    {
        auth: {
            autoRefreshToken: false,
            persistSession: false
        }
    }
);

// GET /api/users - List all users (Admin only)
export async function GET(request) {
    try {
        await requirePermission(request, 'MANAGE_USERS');

        const users = await prisma.user.findMany({
            orderBy: { createdAt: 'desc' },
            select: {
                id: true,
                email: true,
                name: true,
                role: true,
                lot: true,
                createdAt: true,
                updatedAt: true,
            },
        });

        return NextResponse.json({ users });

    } catch (error) {
        console.error('Get users error:', error);
        return NextResponse.json(
            { error: error.message || 'Erreur lors de la récupération des utilisateurs' },
            { status: error.message === 'Unauthorized' ? 401 : error.message === 'Forbidden' ? 403 : 500 }
        );
    }
}

// POST /api/users - Create new user (Admin only)
export async function POST(request) {
    try {
        await requirePermission(request, 'MANAGE_USERS');
        const body = await request.json();

        const { email, name, role, lot, password } = body;

        // Validate required fields
        if (!email || !name || !role) {
            return NextResponse.json(
                { error: 'Email, nom et rôle sont requis' },
                { status: 400 }
            );
        }

        // Check if user already exists
        const existingUser = await prisma.user.findUnique({
            where: { email },
        });

        if (existingUser) {
            return NextResponse.json(
                { error: 'Un utilisateur avec cet email existe déjà' },
                { status: 400 }
            );
        }

        // Create user in Supabase Auth
        const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
            email,
            password: password || 'demo123', // Default password
            email_confirm: true, // Auto-confirm email
        });

        if (authError) {
            console.error('Supabase auth error:', authError);
            return NextResponse.json(
                { error: 'Erreur lors de la création du compte: ' + authError.message },
                { status: 500 }
            );
        }

        // Create user in database
        const user = await prisma.user.create({
            data: {
                id: authData.user.id,
                email,
                name,
                role,
                lot: lot || null,
            },
            select: {
                id: true,
                email: true,
                name: true,
                role: true,
                lot: true,
                createdAt: true,
            },
        });

        console.log('User created:', user.email);

        return NextResponse.json({ user }, { status: 201 });

    } catch (error) {
        console.error('Create user error:', error);
        return NextResponse.json(
            { error: error.message || 'Erreur lors de la création de l\'utilisateur' },
            { status: 500 }
        );
    }
}

// DELETE /api/users?id=xxx - Delete user (Admin only)
export async function DELETE(request) {
    try {
        await requirePermission(request, 'MANAGE_USERS');
        const { searchParams } = new URL(request.url);
        const userId = searchParams.get('id');

        if (!userId) {
            return NextResponse.json(
                { error: 'ID utilisateur requis' },
                { status: 400 }
            );
        }

        // Check if user exists
        const user = await prisma.user.findUnique({
            where: { id: userId },
        });

        if (!user) {
            return NextResponse.json(
                { error: 'Utilisateur non trouvé' },
                { status: 404 }
            );
        }

        // Delete from Supabase Auth
        const { error: authError } = await supabaseAdmin.auth.admin.deleteUser(userId);

        if (authError) {
            console.error('Supabase delete error:', authError);
            // Continue anyway to delete from database
        }

        // Delete from database
        await prisma.user.delete({
            where: { id: userId },
        });

        console.log('User deleted:', userId);

        return NextResponse.json({ success: true, message: 'Utilisateur supprimé' });

    } catch (error) {
        console.error('Delete user error:', error);
        return NextResponse.json(
            { error: error.message || 'Erreur lors de la suppression' },
            { status: 500 }
        );
    }
}

// PUT /api/users - Update user (Admin only)
export async function PUT(request) {
    try {
        await requirePermission(request, 'MANAGE_USERS');
        const body = await request.json();

        const { id, name, role, lot } = body;

        if (!id) {
            return NextResponse.json(
                { error: 'ID utilisateur requis' },
                { status: 400 }
            );
        }

        const user = await prisma.user.update({
            where: { id },
            data: {
                name: name || undefined,
                role: role || undefined,
                lot: lot !== undefined ? lot : undefined,
                updatedAt: new Date(),
            },
            select: {
                id: true,
                email: true,
                name: true,
                role: true,
                lot: true,
                updatedAt: true,
            },
        });

        console.log('User updated:', user.email);

        return NextResponse.json({ user });

    } catch (error) {
        console.error('Update user error:', error);
        return NextResponse.json(
            { error: error.message || 'Erreur lors de la mise à jour' },
            { status: 500 }
        );
    }
}
