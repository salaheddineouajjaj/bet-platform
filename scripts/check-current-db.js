const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    try {
        const projects = await prisma.project.findMany({
            select: { id: true, name: true, createdAt: true }
        });

        console.log('=== Projects in CURRENT database ===');
        projects.forEach(p => {
            const date = new Date(p.createdAt).toISOString().split('T')[0];
            console.log(`- ${p.name} (Created: ${date})`);
        });
        console.log(`\nTotal: ${projects.length} projects`);

        const users = await prisma.user.count();
        console.log(`Users: ${users}`);
    } catch (e) {
        console.error('Error:', e.message);
    } finally {
        await prisma.$disconnect();
    }
}

main();
