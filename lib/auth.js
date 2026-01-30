import { supabase } from './supabase';
import prisma from './prisma';

export const ROLES = {
    CHEF_DE_PROJET: 'CHEF_DE_PROJET',
    REFERENT_LOT: 'REFERENT_LOT',
    CONTRIBUTEUR: 'CONTRIBUTEUR',
    EXTERNE: 'EXTERNE',
};

export async function getCurrentUser(request) {
    try {
        let accessToken = null;

        // 1. D'abord on vérifie le Header Authorization (plus fiable sur Vercel)
        const authHeader = request?.headers?.get('Authorization');
        if (authHeader && authHeader.startsWith('Bearer ')) {
            accessToken = authHeader.split(' ')[1];
        }

        // 2. Si non trouvé, on cherche dans les cookies
        if (!accessToken) {
            const cookieHeader = request?.headers?.get('cookie') || '';
            const tokenMatch = cookieHeader.match(/sb-[^=]+-auth-token=([^;]+)/) ||
                cookieHeader.match(/supabase-auth-token=([^;]+)/);

            if (tokenMatch) {
                const tokenData = decodeURIComponent(tokenMatch[1]);
                try {
                    const parsed = JSON.parse(tokenData);
                    accessToken = parsed.access_token || (Array.isArray(parsed) ? parsed[0] : null);
                } catch (e) {
                    accessToken = tokenData;
                }
            }
        }

        if (!accessToken || accessToken === 'undefined') {
            console.log('[AUTH] Aucun token trouvé');
            return null;
        }

        const { data: { user }, error } = await supabase.auth.getUser(accessToken);
        if (error || !user) {
            console.error('[AUTH] Erreur Supabase:', error?.message);
            return null;
        }

        return await prisma.user.findUnique({
            where: { email: user.email },
        });
    } catch (error) {
        console.error('[AUTH] Erreur serveur:', error.message);
        return null;
    }
}

export async function requireAuth(req) {
    const user = await getCurrentUser(req);
    if (user) return user;

    if (process.env.NODE_ENV === 'development') {
        return await prisma.user.findFirst({ where: { role: 'CHEF_DE_PROJET' } }) || {
            id: 'mock-id', email: 'chef@bet-platform.com', name: 'Marie Dupont', role: 'CHEF_DE_PROJET',
        };
    }
    throw new Error('Unauthorized');
}
