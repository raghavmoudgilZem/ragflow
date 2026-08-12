import { initializeDatabase } from '../db.js';
import { IdentityRepository } from './repository.js';

export function runSeedScript(): void {
    console.log("⚡ Executing Identity Local Development Seeding Script...");
    initializeDatabase();
    IdentityRepository.seedInitialData();
    console.log("Identity Seeding Completed Successfully.");
}

if (import.meta.url === `file://${process.argv[1]}`) {
    runSeedScript();
}