const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Clean up any existing build directories
const buildDirs = ['build', 'build-output'];
buildDirs.forEach(dir => {
  const buildDir = path.join(__dirname, dir);
  if (fs.existsSync(buildDir)) {
    try {
      console.log(`Attempting to remove ${dir} directory...`);
      fs.rmSync(buildDir, { recursive: true, force: true });
      console.log(`Successfully removed ${dir} directory`);
    } catch (err) {
      console.warn(`Warning: Could not remove ${dir} directory: ${err.message}`);
    }
  }
});

// Create dist directory if it doesn't exist
const distDir = path.join(__dirname, 'dist');
if (!fs.existsSync(distDir)) {
  fs.mkdirSync(distDir, { recursive: true });
  console.log('Created dist directory');
}

// Copy all JS files to dist
const jsFiles = ['index.js', 'main.js', 'preload.js'];
jsFiles.forEach(file => {
  const sourcePath = path.join(__dirname, file);
  const destPath = path.join(distDir, file);
  
  if (fs.existsSync(sourcePath)) {
    fs.copyFileSync(sourcePath, destPath);
    console.log(`Copied ${file} to dist directory`);
  } else {
    console.warn(`Warning: ${file} not found`);
  }
});

// Copy package.json to dist directory
const packageJsonPath = path.join(__dirname, 'package.json');
const distPackageJsonPath = path.join(distDir, 'package.json');
if (fs.existsSync(packageJsonPath)) {
  fs.copyFileSync(packageJsonPath, distPackageJsonPath);
  console.log('Copied package.json to dist directory');
  
  // Install production dependencies in the dist directory
  try {
    console.log('Installing production dependencies in dist directory...');
    execSync('npm install --only=prod', { 
      cwd: distDir, 
      stdio: 'inherit' 
    });
    console.log('Successfully installed production dependencies');
  } catch (err) {
    console.error('Error installing dependencies:', err.message);
    process.exit(1);
  }
} else {
  console.error('ERROR: package.json not found');
  process.exit(1);
}

// Verify that the frontend and backend build directories exist
const frontendDistDir = path.join(__dirname, '..', 'frontend', 'dist');
const backendDistDir = path.join(__dirname, '..', 'backend', 'dist-prod');

if (!fs.existsSync(frontendDistDir)) {
  console.error('ERROR: Frontend dist directory does not exist. Make sure to build the frontend first.');
  process.exit(1);
}

if (!fs.existsSync(backendDistDir)) {
  console.error('ERROR: Backend dist-prod directory does not exist. Make sure to build the backend first.');
  process.exit(1);
}

console.log('Dist directory prepared successfully');
console.log('Frontend dist directory exists:', fs.existsSync(frontendDistDir));
console.log('Backend dist directory exists:', fs.existsSync(backendDistDir)); 