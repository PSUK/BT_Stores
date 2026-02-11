import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    const stores = await prisma.store.findMany();
    const typeCounts = stores.reduce((acc, store) => {
        const type = store.type || 'UNDEFINED';
        acc[type] = (acc[type] || 0) + 1;
        return acc;
    }, {} as Record<string, number>);

    console.log('Store Type Counts:', typeCounts);

    // Print a few examples of each type
    const deliveryExample = stores.find(s => s.type === 'DELIVERY_STA');
    const fslExample = stores.find(s => s.type === 'FSL_STA');

    console.log('Delivery Example:', deliveryExample ? { name: deliveryExample.name, type: deliveryExample.type } : 'None');
    console.log('FSL Example:', fslExample ? { name: fslExample.name, type: fslExample.type } : 'None');
}

main()
    .catch(e => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
