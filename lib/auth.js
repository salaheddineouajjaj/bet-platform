import { supabase } from './supabase';
import prisma from './prisma';

// User Roles
export const ROLES = {
    CHEF_DE_PROJET: 'CHEF_DE_PROJET',
    REFERENT_LOT: 'REFERENT_LOT',
    CONTRIBUTEUR: 'CONTRIBUTEUR',
    EXTERNE: 'EXTERNE',
};

// Permissions mapping
export const PERMISSIONS = {
    CREATE_PROJECT: [ROLES.CHEF_DE_PROJET],
    UPDATE_PROJECT: [ROLES.CHEF_DE_PROJET],
    DELETE_PROJECT: [ROLES.CHEF_DE_PROJET],
    VIEW_PROJECT: [ROLES.CHEF_DE_PROJET, ROLES.REFERENT_LOT, ROLES.CONTRIBUTEUR, ROLES.EXTERNE],
    CREATE_DELIVERABLE: [ROLES.CHEF_DE_PROJET, ROLES.REFERENT_LOT],
    UPDATE_DELIVERABLE: [ROLES.CHEF_DE_PROJET, ROLES.REFERENT_LOT],
    VALIDATE_DELIVERABLE: [ROLES.CHEF_DE_PROJET],
    VIEW_DELIVERABLES: [ROLES.CHEF_DE_PROJET, ROLES.REFERENT_LOT, ROLES.CONTRIBUTEUR, ROLES.EXTERNE],
    UPLOAD_DOCUMENT: [ROLES.CHEF_DE_PROJET, ROLES.REFERENT_LOT, ROLES.CONTRIBUTEUR],
    DELETE_DOCUMENT: [ROLES.CHEF_DE_PROJET, ROLES.REFERENT_LOT],
    VIEW_DOCUMENTS: [ROLES.CHEF_DE_PROJET, ROLES.REFERENT_LOT, ROLES.CONTRIBUTEUR, ROLES.EXTERNE],
    CREATE_REMARK: [ROLES.CHEF_DE_PROJET, ROLES.REFERENT_LOT, ROLES.CONTRIBUTEUR, ROLES.EXTERNE],
    UPDATE_REMARK: [ROLES.CHEF_DE_PROJET, ROLES.REFERENT_LOT],
    COMMENT_REMARK: [ROLES.CHEF_DE_PROJET, ROLES.REFERENT_LOT, ROLES.CONTRIBUTEUR, ROLES.EXTERNE],
    CREATE_MEETING: [ROLES.CHEF_DE_PROJET, ROLES.REFERENT_LOT],
    UPDATE_MEETING: [ROLES.CHEF_DE_PROJET, ROLES.REFERENT_LOT],
    CREATE_DECISION: [ROLES.CHEF_DE_PROJET, ROLES.EXTERNE],
    VIEW_DECISIONS: [ROLES.CHEF_DE_PROJET, ROLES.REFERENT_LOT, ROLES.CONTRIBUTEUR, ROLES.EXTERNE],
    CREATE_RISK: [ROLES.CHEF_DE_PROJET, ROLES.REFERENT_LOT],
    UPDATE_RISK: [ROLES.CHEF_DE_PROJET, ROLES.REFERENT_LOT],
    MANAGE_USERS: [ROLES.CHEF_DE_PROJET],
};

export async function getCurrentUser(request) {
    try {
        const cookies = request?.headers?.get('cookie') || '';
        const tokenMatch = cookies.match(/sb-[^=]+-auth-token=([^;]+)/);

        if (!tokenMatch) return null;

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

        return await prisma.user.findUnique({
            where: { email: user.email },
        });
    } catch (error) {
        console.error('[AUTH] Error:', error);
        return null;
    }
}

export function hasPermission(user, permission) {
    if (!user?.role) return false;
    const allowedRoles = PERMISSIONS[permission];
    return allowedRoles ? allowedRoles.includes(user.role) : false;
}

export function canAccessLot(user, lot) {
    if (!user) return false;
    if (user.role === ROLES.CHEF_DE_PROJET || user.role === ROLES.EXTERNE) return true;
    return (user.role === ROLES.REFERENT_LOT || user.role === ROLES.CONTRIBUTEUR) && user.lot === lot;
}

export function canEditLot(user, lot) {
    if (!user) return false;
    if (user.role === ROLES.CHEF_DE_PROJET) return true;
    return (user.role === ROLES.REFERENT_LOT || user.role === ROLES.CONTRIBUTEUR) && user.lot === lot;
}

export async function requireAuth(req) {
    const user = await getCurrentUser(req);
    if (user) return user;

    if (process.env.NODE_ENV === 'development') {
        return {
            id: 'cmkb7aqbo0000y7bkvt929h32',
            email: 'chef@bet-platform.com',
            name: 'Marie Dupont',
            role: 'CHEF_DE_PROJET',
        };
    }
    throw new Error('Unauthorized');
}

export async function requirePermission(req, permission) {
    const user = await requireAuth(req);
    if (!hasPermission(user, permission)) {
        throw new Error('Forbidden: Insufficient permissions');
    }
    return user;
}
