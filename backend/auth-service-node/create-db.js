const { Client } = require('pg');
require('dotenv').config();

async function createDatabase() {
  const dbUrl = new URL(process.env.DATABASE_URL);
  const dbName = dbUrl.pathname.slice(1);
  
  // Connexion au serveur PostgreSQL (base postgres par défaut)
  const client = new Client({
    host: dbUrl.hostname,
    port: dbUrl.port || 5432,
    user: dbUrl.username,
    password: dbUrl.password,
    database: 'postgres'
  });

  try {
    await client.connect();
    
    // Vérifier si la base existe
    const res = await client.query(
      `SELECT 1 FROM pg_database WHERE datname = $1`,
      [dbName]
    );
    
    if (res.rows.length === 0) {
      await client.query(`CREATE DATABASE ${dbName}`);
      console.log(`✅ Base de données '${dbName}' créée avec succès`);
    } else {
      console.log(`ℹ️  Base de données '${dbName}' existe déjà`);
    }
  } catch (error) {
    console.error('❌ Erreur:', error.message);
  } finally {
    await client.end();
  }
}

createDatabase();
