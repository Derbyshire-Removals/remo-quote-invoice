import ghpages from 'gh-pages';
import { execSync } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

// Get the directory name in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// First, run the build command
console.log('Building the project...');
try {
  execSync('npm run build', { stdio: 'inherit' });
} catch (error) {
  console.error('Build failed:', error);
  process.exit(1);
}

// The directory containing the built files
const buildDir = path.join(__dirname, 'dist');

// Create CNAME file
console.log('Creating CNAME file...');
try {
  fs.writeFileSync(path.join(buildDir, 'CNAME'), 'crm.kamalpreetsingh.com');
} catch (error) {
  console.error('Failed to create CNAME file:', error);
  process.exit(1);
}

// You can customize these options as needed
const options = {
  branch: 'gh-pages',
  repo: 'https://github.com/Derbyshire-Removals/remo-quote-invoice.git',
  message: 'Auto-generated commit from deploy script'
};

console.log('Deploying to GitHub Pages...');
ghpages.publish(buildDir, options, function(err) {
  if (err) {
    console.error('Deployment failed:', err);
    process.exit(1);
  } else {
    console.log('Successfully deployed to GitHub Pages!');
  }
});