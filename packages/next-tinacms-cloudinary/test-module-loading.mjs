#!/usr/bin/env node

/**
 * Test script to verify that next-tinacms-cloudinary loads correctly as an ES module
 * This simulates the Lambda/Node.js environment that was throwing the error
 */

console.log('Testing next-tinacms-cloudinary module loading...\n');

try {
  // Import the handlers module - this is the one mentioned in the error
  console.log('Loading handlers.js...');
  const handlers = await import('./dist/handlers.js');
  console.log('✅ handlers.js loaded successfully!');
  console.log('  Exports:', Object.keys(handlers).join(', '));

  // Also test the main index
  console.log('\nLoading index.js...');
  const index = await import('./dist/index.js');
  console.log('✅ index.js loaded successfully!');
  console.log('  Exports:', Object.keys(index).join(', '));

  console.log('\n✅ All modules loaded successfully!');

} catch (error) {
  console.error('❌ Failed to load module:');
  console.error(error.message);
  console.error('\nFull error:');
  console.error(error);
  process.exit(1);
}
