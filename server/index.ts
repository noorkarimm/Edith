import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

// Load environment variables from the root .env file
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const rootDir = join(__dirname, '..');

// Load environment variables before importing any other modules
dotenv.config({ path: join(rootDir, '.env') });

// Verify Clerk keys are loaded
if (!process.env.CLERK_PUBLISHABLE_KEY) {
  console.error('CLERK_PUBLISHABLE_KEY is missing from environment variables');
  process.exit(1);
}

if (!process.env.CLERK_SECRET_KEY) {
  console.error('CLERK_SECRET_KEY is missing from environment variables');
  process.exit(1);
}

import { routes } from './routes.js';

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Use routes
app.use('/api', routes);

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log('Environment variables loaded successfully');
});