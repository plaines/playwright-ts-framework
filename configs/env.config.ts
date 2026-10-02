import { config as loadDotenv } from 'dotenv';
import environments from './environments.json';

// Loads .env (git-ignored) into process.env. Real CI variables take precedence.
loadDotenv({ quiet: true });

export type EnvName = keyof typeof environments;

const envName = (process.env.TEST_ENV ?? 'demo') as EnvName;
if (!(envName in environments)) {
  throw new Error(`Unknown TEST_ENV "${envName}". Valid values: ${Object.keys(environments).join(', ')}`);
}

function requireVar(name: string): string {
  const value = process.env[name];
  if (!value) throw new Error(`Missing environment variable ${name}. Copy .env.example to .env and fill it in.`);
  return value;
}

export const ENV = {
  name: envName,
  ...environments[envName],
  // Lazy getter: API tests do not need UI credentials, so they don't fail when they're absent.
  get credentials() {
    return { username: requireVar('ORANGEHRM_USERNAME'), password: requireVar('ORANGEHRM_PASSWORD') };
  },
};
