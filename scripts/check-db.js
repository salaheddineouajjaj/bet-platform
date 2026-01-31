const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    const projectCount = await prisma.project.count();
    const projects = await prisma.project.findMany({
        select: { id: true, name: true, createdAt: true }
    });
    const userCount = await prisma.user.count();

    console.log('--- DATABASE STATUS ---');
    console.log(`Project Count: ${projectCount}`);
    console.log('Projects:', projects);
    console.log(`User Count: ${userCount}`);
    console.log('-----------------------');
}

main()
    .catch(e => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
