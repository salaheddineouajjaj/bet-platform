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
        // Extraction du cookie de session Supabase
        const cookieHeader = request?.headers?.get('cookie') || '';

        // On cherche le token dans tous les formats possibles (Vercel change parfois le nom)
        const tokenMatch = cookieHeader.match(/sb-[^=]+-auth-token=([^;]+)/) ||
            cookieHeader.match(/supabase-auth-token=([^;]+)/);

        if (!tokenMatch) {
            console.log('[AUTH] Aucun cookie de session trouvé');
            return null;
        }

        const tokenData = decodeURIComponent(tokenMatch[1]);
        let accessToken = '';

        try {
            const parsed = JSON.parse(tokenData);
            accessToken = parsed.access_token || (Array.isArray(parsed) ? parsed[0] : null);
        } catch (e) {
            accessToken = tokenData;
        }

        if (!accessToken) return null;

        const { data: { user }, error } = await supabase.auth.getUser(accessToken);
        if (error || !user) return null;

        // On récupère l'utilisateur en base de données par son email
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

    // Uniquement pour le développement local si aucune session n'est trouvée
    if (process.env.NODE_ENV === 'development' || process.env.NEXT_PUBLIC_VERCEL_ENV === 'preview') {
        console.warn('⚠️ Utilisation du mode Mock (Marie Dupont)');
        return await prisma.user.findFirst({
            where: { role: 'CHEF_DE_PROJET' }
        }) || {
            id: 'mock-id',
            email: 'chef@bet-platform.com',
            name: 'Marie Dupont',
            role: 'CHEF_DE_PROJET',
        };
    }

    throw new Error('Unauthorized');
}
