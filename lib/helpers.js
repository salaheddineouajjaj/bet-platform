/**
 * Format date to French locale
 */
export function formatDate(date) {
    if (!date) return '-';

    return new Date(date).toLocaleDateString('fr-FR', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
    });
}

/**
 * Format datetime to French locale
 */
export function formatDateTime(date) {
    if (!date) return '-';

    return new Date(date).toLocaleString('fr-FR', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    });
}

/**
 * Check if a deliverable is late (past due date)
 */
export function isDeliverableLate(deliverable) {
    if (!deliverable.dueDate) return false;
    if (deliverable.status === 'VALIDE') return false; // Validated deliverables are not late

    const now = new Date();
    const dueDate = new Date(deliverable.dueDate);

    return now > dueDate;
}

/**
 * Check if a remark is overdue
 */
export function isRemarkOverdue(remark) {
    if (!remark.deadline) return false;
    if (remark.status === 'FERME' || remark.status === 'VALIDE') return false;

    const now = new Date();
    const deadline = new Date(remark.deadline);

    return now > deadline;
}

/**
 * Get status badge color class
 */
export function getStatusColor(status) {
    const colors = {
        // Deliverable statuses
        A_FAIRE: 'gray',
        EN_COURS: 'blue',
        DEPOSE: 'purple',
        A_VALIDER: 'orange',
        VALIDE: 'green',
        REJETE: 'red',

        // Remark statuses
        OUVERT: 'red',
        RESOLU: 'green',

        // Risk statuses
        OPEN: 'red',
        MITIGATING: 'orange',
        RESOLVED: 'green',

        // Action item statuses
        TODO: 'gray',
        IN_PROGRESS: 'blue',
        DONE: 'green',
    };

    return colors[status] || 'gray';
}

/**
 * Get priority badge color
 */
export function getPriorityColor(priority) {
    const colors = {
        BASSE: 'gray',
        MOYENNE: 'blue',
        HAUTE: 'orange',
        CRITIQUE: 'red',
    };

    return colors[priority] || 'gray';
}

/**
 * Get impact type color
 */
export function getImpactColor(impactType) {
    const colors = {
        DELAY: 'orange',
        COST: 'red',
        PENALTY: 'red',
    };

    return colors[impactType] || 'gray';
}

/**
 * Format file size in human readable format
 */
export function formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';

    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
}

/**
 * Get phase display name
 */
export function getPhaseDisplayName(phase) {
    const phases = {
        APS: 'APS - Avant-Projet Sommaire',
        APD: 'APD - Avant-Projet Définitif',
        PRO: 'PRO - Projet',
        DCE: 'DCE - Dossier de Consultation des Entreprises',
        ACT: 'ACT - Assistance aux Contrats de Travaux',
    };

    return phases[phase] || phase;
}

/**
 * Get folder path display name
 */
export function getFolderDisplayName(path) {
    const folders = {
        '00_Admin': '00 - Administration',
        '01_APS': '01 - APS',
        '02_APD': '02 - APD',
        '03_PRO': '03 - PRO',
        '04_DCE': '04 - DCE',
        '05_ACT': '05 - ACT',
    };

    return folders[path] || path;
}

/**
 * Get activity type icon/label
 */
export function getActivityTypeLabel(type) {
    const labels = {
        PROJECT_CREATED: 'Projet créé',
        DELIVERABLE_CREATED: 'Livrable créé',
        DELIVERABLE_STATUS_CHANGED: 'Statut livrable modifié',
        DOCUMENT_UPLOADED: 'Document déposé',
        REMARK_CREATED: 'Remarque ouverte',
        REMARK_STATUS_CHANGED: 'Remarque mise à jour',
        MEETING_CREATED: 'Réunion planifiée',
        DECISION_MADE: 'Décision prise',
        RISK_CREATED: 'Risque identifié',
        RISK_STATUS_CHANGED: 'Risque mis à jour',
    };

    return labels[type] || type;
}

/**
 * Calculate days until/since a date
 */
export function getDaysUntil(date) {
    if (!date) return null;

    const now = new Date();
    const target = new Date(date);
    const diffTime = target - now;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    return diffDays;
}

/**
 * Get relative time string (e.g., "il y a 2 heures")
 */
export function getRelativeTime(date) {
    if (!date) return '-';

    const now = new Date();
    const past = new Date(date);
    const diffMs = now - past;

    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return "à l'instant";
    if (diffMins < 60) return `il y a ${diffMins} min`;
    if (diffHours < 24) return `il y a ${diffHours}h`;
    if (diffDays < 7) return `il y a ${diffDays}j`;

    return formatDate(date);
}

/**
 * Truncate text with ellipsis
 */
export function truncate(text, maxLength = 100) {
    if (!text) return '';
    if (text.length <= maxLength) return text;

    return text.substring(0, maxLength) + '...';
}

/**
 * Generate initials from name
 */
export function getInitials(name) {
    if (!name) return '?';

    return name
        .split(' ')
        .map(word => word[0])
        .join('')
        .toUpperCase()
        .substring(0, 2);
}
