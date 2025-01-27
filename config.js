import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

// Get the directory name of the current module
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables from .env file
const result = dotenv.config({ path: join(__dirname, '.env') });

if (result.error) {
    console.error('❌ Error loading .env file:', result.error);
    process.exit(1);
}

// Log all environment variables (use caution with sensitive data in production)
console.log('✅ Loaded environment variables:');
Object.entries(process.env).forEach(([key, value]) => {
    const hiddenValue = key.toLowerCase().includes('password') || key.toLowerCase().includes('key') 
        ? '[HIDDEN]' 
        : value;
    console.log(`${key}: ${hiddenValue}`);
});

// Validate required environment variables
const requiredEnvVars = [
    'MONGO_URI',
    'ENCRYPTION_KEY',
    'EMAIL_USER',
    'EMAIL_PASSWORD',
    'APP_NAME',
    'JWT_SECRET',
    'PORT'
];

const missingEnvVars = requiredEnvVars.filter(varName => !process.env[varName]);

if (missingEnvVars.length > 0) {
    console.error('❌ Missing required environment variables:', missingEnvVars.join(', '));
    process.exit(1);
}

console.log('✅ All required environment variables are present.');

// Export validated config
export const config = {
    PORT: process.env.PORT || 5000,
    RESET_COLLECTIONS: process.env.RESET_COLLECTIONS === 'true', // Convert to boolean
    JWT_SECRET: process.env.JWT_SECRET,
    JWT_REFRESH_SECRET: process.env.JWT_REFRESH_SECRET,
    MONGO_URI: process.env.MONGO_URI,
    ENCRYPTION_KEY: process.env.ENCRYPTION_KEY,
    EMAIL_USER: process.env.EMAIL_USER,
    EMAIL_PASSWORD: process.env.EMAIL_PASSWORD,
    APP_NAME: process.env.APP_NAME,
};
