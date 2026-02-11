import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('Checking database content...');
    const stores = await prisma.store.findMany({
        take: 5,
    });
    console.log('First 5 stores:', JSON.stringify(stores, null, 2));

    const fslCount = await prisma.store.count({
        where: { type: 'FSL_STA' }
    });
    const ecpCount = await prisma.store.count({
        where: { type: 'DELIVERY_STA' }
    });

    console.log(`FSL Count: ${fslCount}`);
    console.log(`ECP Count: ${ecpCount}`);
}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect());
