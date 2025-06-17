#!/usr/bin/env node
import { execSync } from 'child_process';
import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';

interface TenantArgs {
  slug: string;
  displayName: string;
}

const argv = yargs(hideBin(process.argv))
  .option('slug', {
    type: 'string',
    description: 'Tenant slug/identifier',
    demandOption: true,
  })
  .option('displayName', {
    type: 'string', 
    description: 'Display name for the tenant',
    demandOption: true,
  })
  .parseSync() as TenantArgs;

async function onboardTenant(slug: string, displayName: string) {
  try {
    console.log(`🚀 Onboarding tenant: ${displayName} (${slug})`);

    // For demo purposes, generate a mock tenantId
    const tenantId = `tenant_${slug}_${Date.now()}`;
    console.log(`✅ Generated tenant ID: ${tenantId}`);

    // Create Firebase hosting site
    console.log('🌐 Creating Firebase hosting site...');
    try {
      execSync(`firebase hosting:sites:create ${slug}`, { 
        stdio: 'inherit',
        cwd: process.cwd() 
      });
      console.log(`✅ Created hosting site: ${slug}`);
    } catch (error) {
      console.warn(`⚠️  Hosting site creation failed (may already exist): ${error}`);
    }

    // Apply hosting target
    console.log('🎯 Applying hosting target...');
    try {
      execSync(`firebase target:apply hosting ${slug} ${slug}`, {
        stdio: 'inherit',
        cwd: process.cwd()
      });
      console.log(`✅ Applied hosting target: ${slug}`);
    } catch (error) {
      console.warn(`⚠️  Target application failed: ${error}`);
    }

    // Note: In a real implementation, you would:
    // 1. Use Firebase Admin SDK to create a tenant in Identity Toolkit
    // 2. Write tenant config to Firestore
    // 3. Set up authentication rules
    
    console.log(`🎉 Successfully onboarded tenant: ${displayName}`);
    console.log(`📋 Tenant ID: ${tenantId}`);
    console.log(`🔗 Slug: ${slug}`);
    
    console.log(`\n🚀 Manual steps to complete:`);
    console.log(`1. Add tenant to Firestore: tenants/${slug}`);
    console.log(`2. Configure Identity Toolkit tenant`);
    console.log(`3. Deploy: firebase deploy --only hosting:${slug}`);
    
    return tenantId;
  } catch (error) {
    console.error('❌ Error onboarding tenant:', error);
    throw error;
  }
}

// Run the script
if (require.main === module) {
  onboardTenant(argv.slug, argv.displayName)
    .then((tenantId) => {
      console.log(`\n✅ Tenant onboarding completed!`);
      console.log(`📋 Tenant ID: ${tenantId}`);
      process.exit(0);
    })
    .catch((error) => {
      console.error('Script failed:', error);
      process.exit(1);
    });
} 