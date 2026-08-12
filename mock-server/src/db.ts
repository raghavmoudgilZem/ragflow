import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { chatRepository } from './chat-services/repository.js';
import { IdentityRepository } from './identity-services/repository.js';
import Database from 'better-sqlite3';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dataDir = path.join(__dirname, '../../data');
const dbPath = path.join(dataDir, 'mock-server.db');

export let db: Database;

export function initializeDatabase(): void {
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }

  db = new Database(dbPath);

  chatRepository.createTables();
  IdentityRepository.initSchema();

  chatRepository.seedData();
  IdentityRepository.seedInitialData();
}