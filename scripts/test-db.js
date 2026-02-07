
const { PrismaClient } = require('@prisma/client');
const ref = 'ekputlomxnidoqsojvzs';
const pass = 'Esarah25.120180';

async function main() {
    const url = `postgresql://postgres:${pass}@db.${ref}.supabase.co:6543/postgres?pgbouncer=true`;
    const prisma = new PrismaClient({ datasources: { db: { url } } });
    try {
        await prisma.user.count();
        console.log('Result: OK');
    } catch (e) {
        console.log('Result: FAIL');
        console.log('Raw: ' + e.message.substring(0, 100).replace(/\n/g, ' '));
    } finally {
        await prisma.$disconnect();
    }
}
main();
