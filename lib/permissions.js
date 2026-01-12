// Role-Based Access Control Helper
// Checks user permissions based on their role

export const ROLES = {
    CHEF_DE_PROJET: 'CHEF_DE_PROJET',
    REFERENT_LOT: 'REFERENT_LOT',
    CONTRIBUTEUR: 'CONTRIBUTEUR',
    EXTERNE: 'EXTERNE',
};

export const PERMISSIONS = {
    // Projects
    CREATE_PROJECT: [ROLES.CHEF_DE_PROJET],
    EDIT_PROJECT: [ROLES.CHEF_DE_PROJET],
    DELETE_PROJECT: [ROLES.CHEF_DE_PROJET],
    VIEW_PROJECT: [ROLES.CHEF_DE_PROJET, ROLES.REFERENT_LOT, ROLES.CONTRIBUTEUR, ROLES.EXTERNE],

    // Deliverables
    CREATE_DELIVERABLE: [ROLES.CHEF_DE_PROJET, ROLES.REFERENT_LOT],
    EDIT_DELIVERABLE: [ROLES.CHEF_DE_PROJET, ROLES.REFERENT_LOT, ROLES.CONTRIBUTEUR],
    VALIDATE_DELIVERABLE: [ROLES.CHEF_DE_PROJET, ROLES.EXTERNE],
    VIEW_DELIVERABLE: [ROLES.CHEF_DE_PROJET, ROLES.REFERENT_LOT, ROLES.CONTRIBUTEUR, ROLES.EXTERNE],

    // Documents
    UPLOAD_DOCUMENT: [ROLES.CHEF_DE_PROJET, ROLES.REFERENT_LOT, ROLES.CONTRIBUTEUR],
    VIEW_DOCUMENT: [ROLES.CHEF_DE_PROJET, ROLES.REFERENT_LOT, ROLES.CONTRIBUTEUR, ROLES.EXTERNE],

    // Remarks
    CREATE_REMARK: [ROLES.CHEF_DE_PROJET, ROLES.REFERENT_LOT],
    COMMENT_REMARK: [ROLES.CHEF_DE_PROJET, ROLES.REFERENT_LOT, ROLES.CONTRIBUTEUR],
    EDIT_REMARK: [ROLES.CHEF_DE_PROJET, ROLES.REFERENT_LOT],

    // Meetings
    CREATE_MEETING: [ROLES.CHEF_DE_PROJET],
    VIEW_MEETING: [ROLES.CHEF_DE_PROJET, ROLES.REFERENT_LOT, ROLES.CONTRIBUTEUR, ROLES.EXTERNE],

    // Decisions
    CREATE_DECISION: [ROLES.CHEF_DE_PROJET, ROLES.EXTERNE],
    VIEW_DECISION: [ROLES.CHEF_DE_PROJET, ROLES.REFERENT_LOT, ROLES.CONTRIBUTEUR, ROLES.EXTERNE],

    // Risks
    CREATE_RISK: [ROLES.CHEF_DE_PROJET, ROLES.REFERENT_LOT],
    EDIT_RISK: [ROLES.CHEF_DE_PROJET, ROLES.REFERENT_LOT],
    VIEW_RISK: [ROLES.CHEF_DE_PROJET, ROLES.REFERENT_LOT, ROLES.CONTRIBUTEUR, ROLES.EXTERNE],
};

/**
 * Check if a user has a specific permission
 * @param {string} userRole - User's role (CHEF_DE_PROJET, REFERENT_LOT, etc.)
 * @param {string} permission - Permission to check (from PERMISSIONS object)
 * @param {object} context - Additional context (e.g., lot for lot-based permissions)
 * @returns {boolean} - True if user has permission
 */
export function hasPermission(userRole, permission, context = {}) {
    const allowedRoles = PERMISSIONS[permission];

    if (!allowedRoles) {
        console.warn(`Unknown permission: ${permission}`);
        return false;
    }

    // Check basic role permission
    if (!allowedRoles.includes(userRole)) {
        return false;
    }

    // Additional lot-based checks for Référent Lot and Contributeur
    if (context.lot && (userRole === ROLES.REFERENT_LOT || userRole === ROLES.CONTRIBUTEUR)) {
        // Référent Lot and Contributeur can only access their own lot
        return context.userLot === context.lot;
    }

    return true;
}

/**
 * Get user role display name
 */
export function getRoleLabel(role) {
    const labels = {
        CHEF_DE_PROJET: 'Chef de Projet',
        REFERENT_LOT: 'Référent Lot',
        CONTRIBUTEUR: 'Contributeur',
        EXTERNE: 'Externe',
    };
    return labels[role] || role;
}

/**
 * Check if button should be visible for user
 */
export function canShowButton(userRole, action) {
    return hasPermission(userRole, action);
}
