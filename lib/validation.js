import { z } from 'zod';

// User schemas
export const userRoleEnum = z.enum(['CHEF_DE_PROJET', 'REFERENT_LOT', 'CONTRIBUTEUR', 'EXTERNE']);

export const createUserSchema = z.object({
    email: z.string().email('Email invalide'),
    name: z.string().min(2, 'Le nom doit contenir au moins 2 caractères'),
    password: z.string().min(8, 'Le mot de passe doit contenir au moins 8 caractères'),
    role: userRoleEnum,
    lot: z.string().optional(),
});

export const loginSchema = z.object({
    email: z.string().email('Email invalide'),
    password: z.string().min(1, 'Mot de passe requis'),
});

// Project schemas
export const projectPhaseEnum = z.enum(['APS', 'APD', 'PRO', 'DCE', 'ACT']);

export const createProjectSchema = z.object({
    name: z.string().min(3, 'Le nom doit contenir au moins 3 caractères'),
    moa: z.string().min(2, 'MOA requis'),
    architecte: z.string().min(2, 'Architecte requis'),
    adresse: z.string().min(5, 'Adresse requise'),
    type: z.string().min(3, 'Type de projet requis'),
    enjeux: z.string().min(10, 'Description des enjeux requise'),
    phase: projectPhaseEnum.default('APS'),
});

export const updateProjectSchema = createProjectSchema.partial();

// Deliverable schemas
export const deliverableStatusEnum = z.enum([
    'A_FAIRE',
    'EN_COURS',
    'DEPOSE',
    'A_VALIDER',
    'VALIDE',
    'REJETE',
]);

export const createDeliverableSchema = z.object({
    projectId: z.string().cuid(),
    lot: z.string().min(1, 'Lot requis'),
    name: z.string().min(3, 'Nom du livrable requis'),
    phase: projectPhaseEnum,
    responsable: z.string().min(2, 'Responsable requis'),
    dueDate: z.string().or(z.date()),
});

export const updateDeliverableSchema = z.object({
    status: deliverableStatusEnum.optional(),
    responsable: z.string().optional(),
    dueDate: z.string().or(z.date()).optional(),
    version: z.string().optional(),
});

// Document schemas
export const createDocumentSchema = z.object({
    projectId: z.string().cuid(),
    deliverableId: z.string().cuid().optional(),
    path: z.enum(['00_Admin', '01_APS', '02_APD', '03_PRO', '04_DCE', '05_ACT']),
    lot: z.string().min(1, 'Lot requis'),
    filename: z.string().min(1, 'Nom de fichier requis'),
    storageUrl: z.string().url('URL invalide'),
});

// Remark schemas
export const remarkPriorityEnum = z.enum(['BASSE', 'MOYENNE', 'HAUTE', 'CRITIQUE']);
export const remarkStatusEnum = z.enum(['OUVERT', 'EN_COURS', 'RESOLU', 'VALIDE', 'FERME']);

export const createRemarkSchema = z.object({
    projectId: z.string().cuid(),
    documentId: z.string().cuid().optional(),
    title: z.string().min(3, 'Titre requis'),
    description: z.string().min(10, 'Description requise'),
    priority: remarkPriorityEnum.default('MOYENNE'),
    responsableId: z.string().cuid(),
    deadline: z.string().or(z.date()).optional(),
});

export const updateRemarkSchema = z.object({
    status: remarkStatusEnum.optional(),
    priority: remarkPriorityEnum.optional(),
    responsableId: z.string().cuid().optional(),
    deadline: z.string().or(z.date()).optional().nullable(),
});

export const createRemarkCommentSchema = z.object({
    remarkId: z.string().cuid(),
    content: z.string().min(1, 'Commentaire requis'),
});

// Meeting schemas
export const createMeetingSchema = z.object({
    projectId: z.string().cuid(),
    title: z.string().min(3, 'Titre requis'),
    date: z.string().or(z.date()),
    participants: z.string().min(1, 'Participants requis'),
    crContent: z.string().min(10, 'Compte rendu requis'),
});

export const updateMeetingSchema = createMeetingSchema.partial().omit({ projectId: true });

export const createActionItemSchema = z.object({
    meetingId: z.string().cuid(),
    description: z.string().min(3, 'Description requise'),
    assignedToId: z.string().cuid(),
    dueDate: z.string().or(z.date()).optional(),
});

export const updateActionItemSchema = z.object({
    status: z.enum(['TODO', 'IN_PROGRESS', 'DONE']).optional(),
    description: z.string().optional(),
    dueDate: z.string().or(z.date()).optional().nullable(),
});

// Decision schemas
export const decisionTypeEnum = z.enum(['TECHNIQUE', 'MOA_VALIDATION', 'ARCHITECT_VALIDATION']);

export const createDecisionSchema = z.object({
    projectId: z.string().cuid(),
    type: decisionTypeEnum,
    title: z.string().min(3, 'Titre requis'),
    description: z.string().min(10, 'Description requise'),
    impact: z.string().optional(),
    isValidated: z.boolean().default(false),
    validatedBy: z.string().optional(),
});

// Risk schemas
export const impactTypeEnum = z.enum(['DELAY', 'COST', 'PENALTY']);
export const riskStatusEnum = z.enum(['OPEN', 'MITIGATING', 'RESOLVED']);

export const createRiskSchema = z.object({
    projectId: z.string().cuid(),
    title: z.string().min(3, 'Titre requis'),
    description: z.string().min(10, 'Description requise'),
    impactType: impactTypeEnum,
    impactValue: z.string().min(1, 'Valeur d\'impact requise'),
    mitigation: z.string().optional(),
    responsableId: z.string().cuid(),
});

export const updateRiskSchema = z.object({
    status: riskStatusEnum.optional(),
    mitigation: z.string().optional(),
    impactValue: z.string().optional(),
    responsableId: z.string().cuid().optional(),
});

// Activity Log schema
export const activityTypeEnum = z.enum([
    'PROJECT_CREATED',
    'DELIVERABLE_CREATED',
    'DELIVERABLE_STATUS_CHANGED',
    'DOCUMENT_UPLOADED',
    'REMARK_CREATED',
    'REMARK_STATUS_CHANGED',
    'MEETING_CREATED',
    'DECISION_MADE',
    'RISK_CREATED',
    'RISK_STATUS_CHANGED',
]);

export const createActivityLogSchema = z.object({
    projectId: z.string().cuid(),
    type: activityTypeEnum,
    description: z.string().min(1),
    metadata: z.string().optional(),
    userId: z.string().cuid(),
});
