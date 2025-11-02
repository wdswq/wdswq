#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const infraDir = path.join(__dirname, '../infra');
const envFile = path.join(infraDir, '.env');
const envDockerFile = path.join(infraDir, '.env.docker');

console.log('🚀 Initializing infrastructure...');

// Create .env file from .env.docker if it doesn't exist
if (!fs.existsSync(envFile)) {
  console.log('📝 Creating .env file from .env.docker...');
  fs.copyFileSync(envDockerFile, envFile);
  console.log('✅ .env file created. Edit infra/.env to customize your configuration.');
} else {
  console.log('ℹ️  .env file already exists.');
}

// Start services
console.log('🔧 Starting infrastructure services...');
try {
  execSync('cd infra && docker compose up -d', { stdio: 'inherit' });
  console.log('✅ Services started successfully!');
  
  console.log('\n📊 Service Information:');
  console.log('  PostgreSQL: localhost:5432');
  console.log('  Qdrant:     localhost:6333');
  console.log('  MinIO:      localhost:9000 (Console: localhost:9001)');
  
  console.log('\n🔑 Default Credentials:');
  console.log('  PostgreSQL: postgres/postgres');
  console.log('  MinIO:      minioadmin/minioadmin');
  
  console.log('\n💡 Useful commands:');
  console.log('  pnpm infra:status - Check service status');
  console.log('  pnpm infra:logs   - View all logs');
  console.log('  pnpm infra:down   - Stop services');
  
} catch (error) {
  console.error('❌ Failed to start services:', error.message);
  process.exit(1);
}
