import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seed file ready');
  console.log('ℹ️  Les utilisateurs seront créés automatiquement lors du premier login depuis Keycloak');
  console.log('✅ No seed needed - users will be auto-created on first login');
}

main()
  .catch((e) => {
    console.error('❌ Error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
