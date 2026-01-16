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
    // Projects
    CREATE_PROJECT: [ROLES.CHEF_DE_PROJET],
    UPDATE_PROJECT: [ROLES.CHEF_DE_PROJET],
    DELETE_PROJECT: [ROLES.CHEF_DE_PROJET],
    VIEW_PROJECT: [ROLES.CHEF_DE_PROJET, ROLES.REFERENT_LOT, ROLES.CONTRIBUTEUR, ROLES.EXTERNE],

    // Deliverables
    CREATE_DELIVERABLE: [ROLES.CHEF_DE_PROJET, ROLES.REFERENT_LOT],
    UPDATE_DELIVERABLE: [ROLES.CHEF_DE_PROJET, ROLES.REFERENT_LOT],
    VALIDATE_DELIVERABLE: [ROLES.CHEF_DE_PROJET],
    VIEW_DELIVERABLES: [ROLES.CHEF_DE_PROJET, ROLES.REFERENT_LOT, ROLES.CONTRIBUTEUR, ROLES.EXTERNE],

    // Documents
    UPLOAD_DOCUMENT: [ROLES.CHEF_DE_PROJET, ROLES.REFERENT_LOT, ROLES.CONTRIBUTEUR],
    DELETE_DOCUMENT: [ROLES.CHEF_DE_PROJET, ROLES.REFERENT_LOT],
    VIEW_DOCUMENTS: [ROLES.CHEF_DE_PROJET, ROLES.REFERENT_LOT, ROLES.CONTRIBUTEUR, ROLES.EXTERNE],

    // Remarks
    CREATE_REMARK: [ROLES.CHEF_DE_PROJET, ROLES.REFERENT_LOT, ROLES.CONTRIBUTEUR, ROLES.EXTERNE],
    UPDATE_REMARK: [ROLES.CHEF_DE_PROJET, ROLES.REFERENT_LOT],
    COMMENT_REMARK: [ROLES.CHEF_DE_PROJET, ROLES.REFERENT_LOT, ROLES.CONTRIBUTEUR, ROLES.EXTERNE],

    // Meetings
    CREATE_MEETING: [ROLES.CHEF_DE_PROJET, ROLES.REFERENT_LOT],
    UPDATE_MEETING: [ROLES.CHEF_DE_PROJET, ROLES.REFERENT_LOT],

    // Decisions
    CREATE_DECISION: [ROLES.CHEF_DE_PROJET, ROLES.EXTERNE],
    VIEW_DECISIONS: [ROLES.CHEF_DE_PROJET, ROLES.REFERENT_LOT, ROLES.CONTRIBUTEUR, ROLES.EXTERNE],

    // Risks
    CREATE_RISK: [ROLES.CHEF_DE_PROJET, ROLES.REFERENT_LOT],
    UPDATE_RISK: [ROLES.CHEF_DE_PROJET, ROLES.REFERENT_LOT],

    // Admin
    MANAGE_USERS: [ROLES.CHEF_DE_PROJET],
};

/**
 * Get current authenticated user from Supabase
 */
export async function getCurrentUser() {
    try {
        const { data: { user }, error } = await supabase.auth.getUser();

        if (error || !user) {
            return null;
        }

        // Get user details from database
        const dbUser = await prisma.user.findUnique({
            where: { email: user.email },
        });

        return dbUser;
    } catch (error) {
        console.error('Error getting current user:', error);
        return null;
    }
}

/**
 * Check if user has permission for an action
 */
export function hasPermission(user, permission) {
    if (!user || !user.role) {
        return false;
    }

    const allowedRoles = PERMISSIONS[permission];
    if (!allowedRoles) {
        return false;
    }

    return allowedRoles.includes(user.role);
}

/**
 * Check if user can access a specific lot
 * CHEF_DE_PROJET: can access all lots
 * REFERENT_LOT/CONTRIBUTEUR: can only access their assigned lot
 * EXTERNE: read-only access to all lots
 */
export function canAccessLot(user, lot) {
    if (!user) return false;

    if (user.role === ROLES.CHEF_DE_PROJET || user.role === ROLES.EXTERNE) {
        return true;
    }

    if (user.role === ROLES.REFERENT_LOT || user.role === ROLES.CONTRIBUTEUR) {
        return user.lot === lot;
    }

    return false;
}

/**
 * Check if user can edit a specific lot
 */
export function canEditLot(user, lot) {
    if (!user) return false;

    if (user.role === ROLES.CHEF_DE_PROJET) {
        return true;
    }

    if (user.role === ROLES.REFERENT_LOT || user.role === ROLES.CONTRIBUTEUR) {
        return user.lot === lot;
    }

    return false; // EXTERNE cannot edit
}

/**
 * Middleware function to protect API routes
 */
export async function requireAuth(req) {
    try {
        const user = await getCurrentUser();

        if (user) {
            return user;
        }
    } catch (error) {
        console.error('Auth error:', error);
    }

    // TEMPORARY: Use mock user in development
    if (process.env.NODE_ENV === 'development') {
        console.log('⚠️ Using mock user for development');
        return {
            id: 'cmkb7aqbo0000y7bkvt929h32', // Real user ID from database
            email: 'chef@bet-platform.com',
            name: 'Marie Dupont',
            role: 'CHEF_DE_PROJET',
            lot: null,
        };
    }

    throw new Error('Unauthorized');
}

/**
 * Middleware to check specific permission
 */
export async function requirePermission(req, permission) {
    const user = await requireAuth(req);

    if (!hasPermission(user, permission)) {
        throw new Error('Forbidden: Insufficient permissions');
    }

    return user;
}
