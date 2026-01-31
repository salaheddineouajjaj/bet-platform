const { PrismaClient } = require('@prisma/client');

// We need to temporarily point to dev.db
// This is tricky because the client is generated for PostgreSQL
// But we can try to use a fresh client if we change the env var and regenerate

console.log('Testing connection to SQLite dev.db...');

const prisma = new PrismaClient({
    datasources: {
        db: {
            url: 'file:./prisma/dev.db'
        }
    }
});

async function main() {
    try {
        const projects = await prisma.project.findMany();
        console.log('Projects in dev.db:', projects.length);
        projects.forEach(p => console.log(`- ${p.name} (${p.id})`));
    } catch (e) {
        console.error('Failed to read dev.db with current client:', e.message);
    } finally {
        await prisma.$disconnect();
    }
}

main();
