const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    console.log('🌱 Starting database seeding...');

    // Clear existing data
    console.log('📤 Clearing existing data...');
    await prisma.activityLog.deleteMany();
    await prisma.risk.deleteMany();
    await prisma.decision.deleteMany();
    await prisma.actionItem.deleteMany();
    await prisma.meetingAttachment.deleteMany();
    await prisma.meeting.deleteMany();
    await prisma.remarkComment.deleteMany();
    await prisma.remark.deleteMany();
    await prisma.documentVersion.deleteMany();
    await prisma.document.deleteMany();
    await prisma.deliverable.deleteMany();
    await prisma.phaseDate.deleteMany();
    await prisma.projectContact.deleteMany();
    await prisma.project.deleteMany();
    await prisma.user.deleteMany();

    // Create users (one for each role)
    console.log('👥 Creating users...');

    const chefProjet = await prisma.user.create({
        data: {
            email: 'chef@bet-platform.com',
            name: 'Marie Dupont',
            role: 'CHEF_DE_PROJET',
        },
    });

    const referentStructure = await prisma.user.create({
        data: {
            email: 'structure@bet-platform.com',
            name: 'Pierre Martin',
            role: 'REFERENT_LOT',
            lot: 'Structure',
        },
    });

    const referentCVC = await prisma.user.create({
        data: {
            email: 'cvc@bet-platform.com',
            name: 'Sophie Bernard',
            role: 'REFERENT_LOT',
            lot: 'CVC',
        },
    });

    const contributeur = await prisma.user.create({
        data: {
            email: 'contrib@bet-platform.com',
            name: 'Luc Moreau',
            role: 'CONTRIBUTEUR',
            lot: 'Électricité',
        },
    });

    const externe = await prisma.user.create({
        data: {
            email: 'moa@bet-platform.com',
            name: 'Jean Architecte',
            role: 'EXTERNE',
        },
    });

    console.log(`✅ Created ${5} users`);

    // Create a sample project
    console.log('🏗️  Creating project...');

    const project = await prisma.project.create({
        data: {
            name: 'Construction Complexe Résidentiel Les Jardins',
            moa: 'Ville de Paris - Direction de l\'Urbanisme',
            architecte: 'Cabinet Architectes Associés',
            adresse: '45 Avenue de la République, 75011 Paris',
            type: 'Résidentiel - Logements collectifs',
            enjeux: 'Construction de 120 logements sociaux avec performance énergétique RT2012. Enjeux: respect du budget de 18M€, livraison en 24 mois, intégration urbaine dans quartier historique.',
            phase: 'APD',
            createdById: chefProjet.id,
            contacts: {
                create: [
                    {
                        name: 'Marie Dupont',
                        role: 'Chef de Projet BET',
                        email: 'chef@bet-platform.com',
                        phone: '01 23 45 67 89',
                    },
                    {
                        name: 'Jean Architecte',
                        role: 'Architecte MOA',
                        email: 'moa@bet-platform.com',
                        phone: '01 98 76 54 32',
                    },
                ],
            },
            phases: {
                create: [
                    {
                        phase: 'APS',
                        startDate: new Date('2024-01-01'),
                        endDate: new Date('2024-03-31'),
                    },
                    {
                        phase: 'APD',
                        startDate: new Date('2024-04-01'),
                        endDate: new Date('2024-06-30'),
                    },
                    {
                        phase: 'PRO',
                        startDate: new Date('2024-07-01'),
                        endDate: new Date('2024-10-31'),
                    },
                    {
                        phase: 'DCE',
                        startDate: new Date('2024-11-01'),
                        endDate: new Date('2025-01-31'),
                    },
                    {
                        phase: 'ACT',
                        startDate: new Date('2025-02-01'),
                        endDate: new Date('2026-02-28'),
                    },
                ],
            },
        },
    });

    console.log(`✅ Created project: ${project.name}`);

    // Create deliverables
    console.log('📋 Creating deliverables...');

    const deliverables = await Promise.all([
        // Structure lot
        prisma.deliverable.create({
            data: {
                projectId: project.id,
                lot: 'Structure',
                name: 'Note de calcul béton armé',
                phase: 'APD',
                responsable: referentStructure.name,
                dueDate: new Date('2024-05-15'),
                status: 'VALIDE',
                version: '2.0',
                createdById: chefProjet.id,
            },
        }),
        prisma.deliverable.create({
            data: {
                projectId: project.id,
                lot: 'Structure',
                name: 'Plans de ferraillage fondations',
                phase: 'APD',
                responsable: referentStructure.name,
                dueDate: new Date('2024-06-01'),
                status: 'A_VALIDER',
                version: '1.0',
                createdById: chefProjet.id,
            },
        }),
        // CVC lot
        prisma.deliverable.create({
            data: {
                projectId: project.id,
                lot: 'CVC',
                name: 'Note de dimensionnement chauffage',
                phase: 'APD',
                responsable: referentCVC.name,
                dueDate: new Date('2024-05-20'),
                status: 'EN_COURS',
                version: '1.0',
                createdById: chefProjet.id,
            },
        }),
        prisma.deliverable.create({
            data: {
                projectId: project.id,
                lot: 'CVC',
                name: 'Schémas de principe ventilation',
                phase: 'APD',
                responsable: referentCVC.name,
                dueDate: new Date('2024-05-10'), // Late deliverable
                status: 'EN_COURS',
                version: '1.0',
                createdById: chefProjet.id,
            },
        }),
        // Électricité lot
        prisma.deliverable.create({
            data: {
                projectId: project.id,
                lot: 'Électricité',
                name: 'Schéma unifilaire tableau général',
                phase: 'APD',
                responsable: contributeur.name,
                dueDate: new Date('2024-06-10'),
                status: 'A_FAIRE',
                version: '1.0',
                createdById: chefProjet.id,
            },
        }),
    ]);

    console.log(`✅ Created ${deliverables.length} deliverables`);

    // Create documents
    console.log('📄 Creating documents...');

    const documents = await Promise.all([
        prisma.document.create({
            data: {
                projectId: project.id,
                deliverableId: deliverables[0].id,
                path: '02_APD',
                lot: 'Structure',
                filename: 'Note_calcul_BA_v2.0.pdf',
                version: '2.0',
                storageUrl: 'https://placeholder-storage.com/note_calcul_v2.pdf',
                uploadedById: referentStructure.id,
            },
        }),
        prisma.document.create({
            data: {
                projectId: project.id,
                deliverableId: deliverables[1].id,
                path: '02_APD',
                lot: 'Structure',
                filename: 'Plans_ferraillage_fondations_v1.0.pdf',
                version: '1.0',
                storageUrl: 'https://placeholder-storage.com/plans_ferraillage.pdf',
                uploadedById: referentStructure.id,
            },
        }),
        prisma.document.create({
            data: {
                projectId: project.id,
                path: '00_Admin',
                lot: 'Général',
                filename: 'CCTP_general.pdf',
                version: '1.0',
                storageUrl: 'https://placeholder-storage.com/cctp.pdf',
                uploadedById: chefProjet.id,
            },
        }),
    ]);

    console.log(`✅ Created ${documents.length} documents`);

    // Create remarks
    console.log('💬 Creating remarks...');

    const remarks = await Promise.all([
        prisma.remark.create({
            data: {
                projectId: project.id,
                documentId: documents[0].id,
                title: 'Vérification charge sismique',
                description: 'La note de calcul doit intégrer les charges sismiques selon la zone 4. Merci de compléter le paragraphe 3.2.',
                priority: 'HAUTE',
                status: 'EN_COURS',
                responsableId: referentStructure.id,
                deadline: new Date('2024-05-25'),
                createdById: chefProjet.id,
                comments: {
                    create: [
                        {
                            content: 'Pris en compte, je mets à jour la note de calcul.',
                            authorId: referentStructure.id,
                        },
                    ],
                },
            },
        }),
        prisma.remark.create({
            data: {
                projectId: project.id,
                documentId: documents[1].id,
                title: 'Détail ancrage poteaux',
                description: 'Les détails d\'ancrage des poteaux en zone de reprise ne sont pas clairs sur le plan. Merci de clarifier.',
                priority: 'MOYENNE',
                status: 'OUVERT',
                responsableId: referentStructure.id,
                deadline: new Date('2024-06-05'),
                createdById: externe.id,
            },
        }),
    ]);

    console.log(`✅ Created ${remarks.length} remarks`);

    // Create a meeting
    console.log('📅 Creating meeting...');

    const meeting = await prisma.meeting.create({
        data: {
            projectId: project.id,
            title: 'Réunion de coordination technique APD',
            date: new Date('2024-05-15T14:00:00'),
            participants: JSON.stringify([
                'Marie Dupont - Chef de Projet',
                'Pierre Martin - Structure',
                'Sophie Bernard - CVC',
                'Jean Architecte - MOA',
            ]),
            crContent: `# Réunion de coordination technique APD

## Participants
- Marie Dupont (Chef de Projet BET)
- Pierre Martin (Référent Structure)
- Sophie Bernard (Référent CVC)
- Jean Architecte (MOA)

## Points abordés

### 1. Avancement des livrables APD
- Structure : Note de calcul validée, plans en cours de finalisation
- CVC : Dimensionnement chauffage en cours, retard sur ventilation à rattraper
- Électricité : Pas encore démarré, à lancer rapidement

### 2. Remarques MOA
- Intégration charges sismiques dans note de calcul → Action Pierre
- Clarification détails ancrage → Action Pierre

### 3. Planning
- Livraison APD complète prévue 30 juin
- Risque de retard sur lot CVC identifié

## Décisions
- Renfort temporaire sur lot CVC pour tenir les délais
- Prochaine réunion : 29 mai 2024`,
            organizerId: chefProjet.id,
            actionItems: {
                create: [
                    {
                        description: 'Intégrer charges sismiques dans note de calcul',
                        assignedToId: referentStructure.id,
                        dueDate: new Date('2024-05-25'),
                        status: 'IN_PROGRESS',
                    },
                    {
                        description: 'Clarifier détails ancrage poteaux sur plans',
                        assignedToId: referentStructure.id,
                        dueDate: new Date('2024-06-05'),
                        status: 'TODO',
                    },
                    {
                        description: 'Rattraper retard schéma ventilation',
                        assignedToId: referentCVC.id,
                        dueDate: new Date('2024-05-30'),
                        status: 'IN_PROGRESS',
                    },
                ],
            },
        },
    });

    console.log(`✅ Created meeting with ${3} action items`);

    // Create decisions
    console.log('✅ Creating decisions...');

    const decisions = await Promise.all([
        prisma.decision.create({
            data: {
                projectId: project.id,
                type: 'TECHNIQUE',
                title: 'Choix système de fondations',
                description: 'Après étude géotechnique, décision de partir sur fondations semi-profondes (puits) au lieu de fondations superficielles initialement prévues. Surcoût estimé : 150k€ mais gain de sécurité important.',
                impact: 'Budget: +150k€ / Planning: +2 semaines études',
                isValidated: true,
                validatedBy: chefProjet.name,
                validatedAt: new Date('2024-04-10'),
                decidedById: chefProjet.id,
            },
        }),
        prisma.decision.create({
            data: {
                projectId: project.id,
                type: 'MOA_VALIDATION',
                title: 'Validation note de calcul structure APD',
                description: 'Validation de la note de calcul béton armé version 2.0 après intégration charges sismiques.',
                isValidated: true,
                validatedBy: externe.name,
                validatedAt: new Date('2024-05-16'),
                decidedById: externe.id,
            },
        }),
    ]);

    console.log(`✅ Created ${decisions.length} decisions`);

    // Create risks
    console.log('⚠️  Creating risks...');

    const risks = await Promise.all([
        prisma.risk.create({
            data: {
                projectId: project.id,
                title: 'Retard livraison schémas CVC',
                description: 'Le lot CVC accumule du retard sur les schémas de ventilation (échéance dépassée de 5 jours). Risque de blocage pour la synthèse architecturale.',
                impactType: 'DELAY',
                impactValue: '2 semaines',
                mitigation: 'Renfort d\'une ressource supplémentaire sur le lot CVC pour finaliser les schémas sous 1 semaine.',
                status: 'MITIGATING',
                responsableId: referentCVC.id,
                createdById: chefProjet.id,
            },
        }),
        prisma.risk.create({
            data: {
                projectId: project.id,
                title: 'Dépassement budget fondations',
                description: 'Le changement de système de fondations entraîne un surcoût de 150k€ non prévu au budget initial.',
                impactType: 'COST',
                impactValue: '150 000 EUR',
                mitigation: 'Négociation avec MOA pour rallonge budgétaire. Optimisation autres lots pour compensation partielle.',
                status: 'OPEN',
                responsableId: chefProjet.id,
                createdById: chefProjet.id,
            },
        }),
    ]);

    console.log(`✅ Created ${risks.length} risks`);

    // Create activity logs
    console.log('📊 Creating activity logs...');

    const activities = await Promise.all([
        prisma.activityLog.create({
            data: {
                projectId: project.id,
                type: 'PROJECT_CREATED',
                description: `Projet "${project.name}" créé`,
                userId: chefProjet.id,
                createdAt: new Date('2024-01-01T09:00:00'),
            },
        }),
        prisma.activityLog.create({
            data: {
                projectId: project.id,
                type: 'DELIVERABLE_CREATED',
                description: `Livrable "Note de calcul béton armé" créé (Structure)`,
                userId: chefProjet.id,
                createdAt: new Date('2024-04-05T10:30:00'),
            },
        }),
        prisma.activityLog.create({
            data: {
                projectId: project.id,
                type: 'DOCUMENT_UPLOADED',
                description: `Document "Note_calcul_BA_v2.0.pdf" déposé`,
                userId: referentStructure.id,
                createdAt: new Date('2024-05-12T15:20:00'),
            },
        }),
        prisma.activityLog.create({
            data: {
                projectId: project.id,
                type: 'REMARK_CREATED',
                description: `Remarque "Vérification charge sismique" ouverte`,
                userId: chefProjet.id,
                createdAt: new Date('2024-05-13T11:00:00'),
            },
        }),
        prisma.activityLog.create({
            data: {
                projectId: project.id,
                type: 'DELIVERABLE_STATUS_CHANGED',
                description: `Livrable "Note de calcul béton armé" → VALIDE`,
                userId: chefProjet.id,
                createdAt: new Date('2024-05-16T14:30:00'),
            },
        }),
        prisma.activityLog.create({
            data: {
                projectId: project.id,
                type: 'MEETING_CREATED',
                description: `Réunion "Réunion de coordination technique APD" planifiée`,
                userId: chefProjet.id,
                createdAt: new Date('2024-05-10T09:00:00'),
            },
        }),
        prisma.activityLog.create({
            data: {
                projectId: project.id,
                type: 'DECISION_MADE',
                description: `Décision technique "Choix système de fondations" prise`,
                userId: chefProjet.id,
                createdAt: new Date('2024-04-10T16:00:00'),
            },
        }),
        prisma.activityLog.create({
            data: {
                projectId: project.id,
                type: 'RISK_CREATED',
                description: `Risque "Retard livraison schémas CVC" identifié`,
                userId: chefProjet.id,
                createdAt: new Date('2024-05-15T17:00:00'),
            },
        }),
    ]);

    console.log(`✅ Created ${activities.length} activity logs`);

    console.log('\n🎉 Database seeding completed successfully!');
    console.log('\n📊 Summary:');
    console.log(`   - 5 users (Chef Projet, 2 Référents Lot, 1 Contributeur, 1 Externe)`);
    console.log(`   - 1 project with 5 phases`);
    console.log(`   - ${deliverables.length} deliverables`);
    console.log(`   - ${documents.length} documents`);
    console.log(`   - ${remarks.length} remarks`);
    console.log(`   - 1 meeting with 3 action items`);
    console.log(`   - ${decisions.length} decisions`);
    console.log(`   - ${risks.length} risks`);
    console.log(`   - ${activities.length} activity logs`);
    console.log('\n📧 Test Users:');
    console.log('   - chef@bet-platform.com (CHEF_DE_PROJET)');
    console.log('   - structure@bet-platform.com (REFERENT_LOT - Structure)');
    console.log('   - cvc@bet-platform.com (REFERENT_LOT - CVC)');
    console.log('   - contrib@bet-platform.com (CONTRIBUTEUR - Électricité)');
    console.log('   - moa@bet-platform.com (EXTERNE)');
}

main()
    .catch((e) => {
        console.error('❌ Error during seeding:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
