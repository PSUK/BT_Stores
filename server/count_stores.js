
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    const count = await prisma.store.count();
    console.log('Total stores in DB:', count);
}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect());
