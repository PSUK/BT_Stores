import fs from 'fs';
import path from 'path';
import https from 'https';

// Paths
const INPUT_FILE = path.join(__dirname, '../../client/src/assets/FSL_STA_LocationsOrg/staLoc.txt');
const OUTPUT_FILE = path.join(__dirname, '../../client/src/assets/FSL_STA_LocationsOrg/sta_locations_geocoded.json');

interface RawLocation {
    staId: number;
    code: string;
    name: string;
    type: string;
    postCode: string;
}

interface GeocodedLocation {
    name: string;
    type: string;
    postcode: string;
    latitude: number;
    longitude: number;
}

async function fetchCoordinates(postcode: string): Promise<{ latitude: number, longitude: number } | null> {
    return new Promise((resolve) => {
        const url = `https://api.postcodes.io/postcodes/${encodeURIComponent(postcode)}`;

        https.get(url, (res) => {
            let data = '';

            res.on('data', (chunk) => {
                data += chunk;
            });

            res.on('end', () => {
                try {
                    const json = JSON.parse(data);
                    if (json.status === 200 && json.result) {
                        resolve({
                            latitude: json.result.latitude,
                            longitude: json.result.longitude
                        });
                    } else {
                        console.warn(`Could not geocode ${postcode}: ${json.error || 'Unknown error'}`);
                        resolve(null);
                    }
                } catch (e) {
                    console.error(`Error parsing response for ${postcode}:`, e);
                    resolve(null);
                }
            });
        }).on('error', (err) => {
            console.error(`Network error for ${postcode}:`, err);
            resolve(null);
        });
    });
}

// Delayer to respect API rate limits (Postcodes.io is generous but good practice)
const delay = (ms: number) => new Promise(res => setTimeout(res, ms));

async function main() {
    console.log(`Reading input from ${INPUT_FILE}...`);

    try {
        const rawData = fs.readFileSync(INPUT_FILE, 'utf8');
        const locations: RawLocation[] = JSON.parse(rawData);

        console.log(`Found ${locations.length} locations to process.`);

        const geocodedLocations: GeocodedLocation[] = [];

        for (const loc of locations) {
            console.log(`Processing ${loc.name} (${loc.postCode})...`);

            const coins = await fetchCoordinates(loc.postCode);

            if (coins) {
                geocodedLocations.push({
                    name: loc.name,
                    type: loc.type,
                    postcode: loc.postCode,
                    latitude: coins.latitude,
                    longitude: coins.longitude
                });
                console.log(`  -> Lat: ${coins.latitude}, Lng: ${coins.longitude}`);
            } else {
                console.warn(`  -> SKIPPED ${loc.name} (Geocoding failed)`);
                // Optionally keep it without coords or handle appropriately
                // The prompt asked to add geocodes, implying we need them.
                // We'll skip for now to keep the output clean, or could add with 0,0
                // Decisions: Only include successful ones based on previous file example
            }

            // Small delay to be polite
            await delay(100);
        }

        console.log(`Successfully geocoded ${geocodedLocations.length}/${locations.length} locations.`);

        fs.writeFileSync(OUTPUT_FILE, JSON.stringify(geocodedLocations, null, 2));
        console.log(`Saved to ${OUTPUT_FILE}`);

    } catch (e) {
        console.error("Error processing files:", e);
    }
}

main();
