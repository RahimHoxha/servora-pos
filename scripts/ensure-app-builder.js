const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const https = require('https');

// Define paths
const rootDir = path.resolve(__dirname, '..');
const appBuilderBinPath = path.join(rootDir, 'node_modules', 'app-builder-bin');
const winX64Path = path.join(appBuilderBinPath, 'win', 'x64');
const appBuilderExePath = path.join(winX64Path, 'app-builder.exe');

console.log('Ensuring app-builder-bin is available...');
console.log(`Looking for app-builder.exe at: ${appBuilderExePath}`);

// Function to download app-builder.exe directly
const downloadAppBuilder = () => {
  return new Promise((resolve, reject) => {
    console.log('Downloading app-builder.exe directly...');
    
    // Create directories if they don't exist
    fs.mkdirSync(winX64Path, { recursive: true });
    
    // URL for app-builder.exe (adjust version as needed)
    const url = 'https://github.com/electron-userland/electron-builder-binaries/raw/master/app-builder/win/x64/app-builder.exe';
    
    const file = fs.createWriteStream(appBuilderExePath);
    https.get(url, (response) => {
      if (response.statusCode !== 200) {
        reject(new Error(`Failed to download app-builder.exe: ${response.statusCode}`));
        return;
      }
      
      response.pipe(file);
      
      file.on('finish', () => {
        file.close();
        console.log('Download completed successfully');
        resolve();
      });
    }).on('error', (err) => {
      fs.unlink(appBuilderExePath, () => {});
      reject(err);
    });
    
    file.on('error', (err) => {
      fs.unlink(appBuilderExePath, () => {});
      reject(err);
    });
  });
};

// Check if app-builder-bin is installed
if (!fs.existsSync(appBuilderBinPath)) {
  console.log('app-builder-bin not found, installing...');
  try {
    execSync('npm install app-builder-bin@5.0.0-alpha.10 --save-dev', { stdio: 'inherit', cwd: rootDir });
  } catch (error) {
    console.error('Failed to install app-builder-bin:', error);
    process.exit(1);
  }
}

// Check if the win/x64 directory exists
if (!fs.existsSync(winX64Path)) {
  console.log('Creating win/x64 directory...');
  fs.mkdirSync(winX64Path, { recursive: true });
}

// Check if app-builder.exe exists
if (!fs.existsSync(appBuilderExePath)) {
  console.log('app-builder.exe not found, attempting to resolve...');
  
  // Try to find it in node_modules
  const nodeModulesPath = path.join(rootDir, 'node_modules');
  let foundPath = null;
  
  // Search for app-builder.exe in node_modules
  const searchForAppBuilder = (dir) => {
    try {
      const files = fs.readdirSync(dir);
      for (const file of files) {
        const filePath = path.join(dir, file);
        try {
          const stat = fs.statSync(filePath);
          
          if (stat.isDirectory() && file !== 'node_modules') {
            try {
              const subFiles = fs.readdirSync(filePath);
              if (subFiles.includes('app-builder.exe')) {
                foundPath = path.join(filePath, 'app-builder.exe');
                return true;
              }
              if (searchForAppBuilder(filePath)) {
                return true;
              }
            } catch (error) {
              // Ignore permission errors
            }
          } else if (file === 'app-builder.exe') {
            foundPath = filePath;
            return true;
          }
        } catch (error) {
          // Ignore stat errors
        }
      }
    } catch (error) {
      console.log(`Error reading directory ${dir}: ${error.message}`);
    }
    return false;
  };
  
  try {
    searchForAppBuilder(nodeModulesPath);
    
    if (foundPath) {
      console.log(`Found app-builder.exe at ${foundPath}`);
      console.log(`Copying to ${appBuilderExePath}`);
      fs.copyFileSync(foundPath, appBuilderExePath);
    } else {
      console.log('Could not find app-builder.exe in node_modules');
      
      // Try direct download
      downloadAppBuilder()
        .then(() => {
          console.log('Successfully downloaded app-builder.exe');
        })
        .catch((error) => {
          console.error('Error downloading app-builder.exe:', error);
          console.log('Reinstalling app-builder-bin...');
          execSync('npm uninstall app-builder-bin && npm install app-builder-bin@5.0.0-alpha.10 --save-dev', { stdio: 'inherit', cwd: rootDir });
        });
    }
  } catch (error) {
    console.error('Error during app-builder.exe search or copy:', error);
    process.exit(1);
  }
}

// Verify the file exists and has proper permissions
if (fs.existsSync(appBuilderExePath)) {
  try {
    // Make sure the file is executable (Windows doesn't need this, but keeping for completeness)
    const stats = fs.statSync(appBuilderExePath);
    console.log(`app-builder.exe exists with size: ${stats.size} bytes`);
    
    // Copy to electron app's node_modules as well to ensure it's available
    const electronAppBuilderPath = path.join(rootDir, 'apps', 'electron', 'node_modules', 'app-builder-bin', 'win', 'x64');
    fs.mkdirSync(electronAppBuilderPath, { recursive: true });
    fs.copyFileSync(appBuilderExePath, path.join(electronAppBuilderPath, 'app-builder.exe'));
    
    console.log('app-builder-bin is ready!');
  } catch (error) {
    console.error('Error verifying app-builder.exe:', error);
    process.exit(1);
  }
} else {
  console.error('Failed to ensure app-builder.exe exists');
  process.exit(1);
} 