import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';

const prisma = new PrismaClient();


async function main() {
    console.log('Seeding database...');

    const fslJsonPath = path.join(__dirname, '../../client/src/assets/FSL_STA_LocationsOrg/fsl_locations_geocoded.json');
    const staJsonPath = path.join(__dirname, '../../client/src/assets/FSL_STA_LocationsOrg/sta_locations_geocoded.json');

    console.log(`Reading FSL locations from ${fslJsonPath}...`);
    console.log(`Reading STA locations from ${staJsonPath}...`);

    const fslRawData = fs.readFileSync(fslJsonPath, 'utf8');
    const staRawData = fs.readFileSync(staJsonPath, 'utf8');

    const fslLocations = JSON.parse(fslRawData);
    const staLocations = JSON.parse(staRawData);

    const locations = [...fslLocations, ...staLocations];

    console.log(`Found ${fslLocations.length} FSL locations and ${staLocations.length} STA locations.`);
    console.log(`Total locations to seed: ${locations.length}`);

    // Clear existing data
    await prisma.store.deleteMany({});
    console.log('Cleared existing stores.');

    for (const loc of locations) {
        // Map JSON fields to Prisma model
        // Required: name, address, postcode, lat, lng
        // Optional: notes

        // We use 'type' as 'notes'
        // We use 'name' as 'address' foundation since we don't have a specific address field, 
        // or we could combine name + postcode, but let's just use the name for now as the user requested "name, type, postcode".
        // The schema requires 'address', so we must provide something.

        await prisma.store.create({
            data: {
                name: loc.name,
                address: loc.name, // Using name as address since specific address line is missing
                postcode: loc.postcode,
                lat: loc.latitude || 0, // Handle potential nulls safely, though we fixed the one null earlier
                lng: loc.longitude || 0,
                type: loc.type as any,
                notes: null
            },
        });
    }

    console.log(`Seeding complete. Inserted ${locations.length} stores.`);
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
