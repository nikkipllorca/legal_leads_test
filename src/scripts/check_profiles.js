const { Client } = require('pg');

const connectionString = 'postgresql://postgres.nljqmifialudlkrebfdf:skM7NvROZDgGERhw@aws-0-us-west-2.pooler.supabase.com:6543/postgres';

async function checkProfiles() {
    const client = new Client({
        connectionString: connectionString,
        ssl: { rejectUnauthorized: false }
    });

    try {
        await client.connect();
        const res = await client.query('SELECT * FROM profiles');
        console.log('Profiles in database:');
        console.table(res.rows);
    } catch (err) {
        console.error('Error:', err.message);
    } finally {
        await client.end();
    }
}

checkProfiles();
