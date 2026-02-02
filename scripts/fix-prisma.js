const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Read .env.local or .env
let envContent = '';
if (fs.existsSync('.env.local')) {
    envContent = fs.readFileSync('.env.local', 'utf8');
} else if (fs.existsSync('.env')) {
    envContent = fs.readFileSync('.env', 'utf8');
}

const dbUrlMatch = envContent.match(/DATABASE_URL=["']?(.+?)["']?(\s|$)/);

if (!dbUrlMatch) {
    console.error('DATABASE_URL not found in .env or .env.local');
    process.exit(1);
}

const dbUrl = dbUrlMatch[1];
console.log('Using DATABASE_URL:', dbUrl.replace(/:.+@/, ':****@'));

try {
    console.log('Generating Prisma Client...');
    // Force DATABASE_URL for the command
    process.env.DATABASE_URL = dbUrl;
    execSync('npx prisma generate', {
        stdio: 'inherit',
        env: { ...process.env, DATABASE_URL: dbUrl }
    });
    console.log('Successfully generated Prisma Client!');
} catch (error) {
    console.error('Failed to generate Prisma Client:', error.message);
    process.exit(1);
}
