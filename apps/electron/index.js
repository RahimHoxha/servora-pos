const { app, BrowserWindow, ipcMain } = require('electron');
const path = require("path");
const childProcess = require('child_process');
const fs = require('fs');
const http = require('http');

let win;
let backendProcess;
let frontendServer;
let backendStarted = false;
let frontendStarted = false;
const FRONTEND_PORT = 5000; // Port for the frontend server

// Ensure only one instance of the app runs
const gotTheLock = app.requestSingleInstanceLock();

if (!gotTheLock) {
    console.log('Another instance is already running. Quitting...');
    app.quit();
} else {
    app.on('second-instance', () => {
        // Someone tried to run a second instance, focus our window instead
        if (win) {
            if (win.isMinimized()) win.restore();
            win.focus();
        }
    });

    app.whenReady().then(() => {
        // Start Backend server in production mode
        if (process.env.NODE_ENV !== 'development') {
            Promise.all([
                startBackendServer(),
                startFrontendServer()
            ]).then(() => {
                createWindow();
            }).catch(err => {
                console.error('Failed to start servers:', err);
                createWindow(); // Still create window even if servers fail
            });
        } else {
            // In development, assume backend is already running
            createWindow();
        }
    });
}

async function startBackendServer() {
    if (backendStarted) return; // Prevent multiple backend instances

    return new Promise((resolve, reject) => {
        try {

            // In development mode, we assume the backend is already running
            if (process.env.NODE_ENV === 'development') {
                backendStarted = true;
                return resolve();
            }

            // In production mode, we need to start the backend
            let backendPath = path.join(
                process.resourcesPath, // Points to app's resources
                'backend',            // Matches extraResources in electron-builder config
                'index.js'            // Correct entry point for the backend
            );

            // Check if the backend file exists
            if (!fs.existsSync(backendPath)) {
                // Try an alternative path
                const altPath = path.join(__dirname, '..', 'backend', 'index.js');
                if (fs.existsSync(altPath)) {
                    backendPath = altPath;
                }
            }


            // Get the directory containing the backend file
            const backendDir = path.dirname(backendPath);

            // Use the simplest possible approach - exec with the exact command that works manually
            // But change the working directory to the backend directory
            const command = `node "${path.basename(backendPath)}"`;

            backendProcess = childProcess.exec(command, {
                cwd: backendDir, // Set the working directory
                env: {
                    ...process.env,
                    PORT: '3001',
                    NODE_ENV: 'production'
                }
            });

            backendProcess.on('exit', (code, signal) => {
                if (code !== 0) {
                    backendStarted = false;
                }
            });

            // Check if the backend is actually running
            const checkBackendRunning = () => {
                const req = http.request({
                    hostname: 'localhost',
                    port: 3001,
                    path: '/api',
                    method: 'GET',
                    timeout: 1000
                }, (res) => {
                    backendStarted = true;
                    resolve();
                });

                req.on('error', (err) => {
                    // Try again after a delay
                    setTimeout(checkBackendRunning, 1000);
                });

                req.on('timeout', () => {
                    req.destroy();
                    // Try again after a delay
                    setTimeout(checkBackendRunning, 1000);
                });

                req.end();
            };

            // Start checking after a short delay
            setTimeout(checkBackendRunning, 1000);

            // Set a maximum timeout to resolve even if we can't connect
            setTimeout(() => {
                if (!backendStarted) {
                    console.log('Backend might be running, but we could not connect to it');
                    backendStarted = true;
                    resolve();
                }
            }, 10000);
        } catch (err) {
            console.error('Error starting backend:', err);
            reject(err);
        }
    });
}

async function startFrontendServer() {
    if (frontendStarted) return; // Prevent multiple frontend server instances

    return new Promise((resolve, reject) => {
        try {
            let frontendPath;

            // First try the resources path (for packaged app)
            if (process.resourcesPath) {
                frontendPath = path.join(process.resourcesPath, 'frontend');
                if (!fs.existsSync(frontendPath)) {
                    // Fallback to relative path (for development)
                    frontendPath = path.join(__dirname, '..', 'frontend', 'dist');
                }
            } else {
                // Fallback to relative path
                frontendPath = path.join(__dirname, '..', 'frontend', 'dist');
            }

            // Check if the frontend directory exists
            if (!fs.existsSync(frontendPath)) {
                console.error(`Frontend directory not found at: ${frontendPath}`);
                return reject(new Error('Frontend directory not found'));
            }

            console.log('Starting frontend server from:', frontendPath);

            // Create a simple HTTP server instead of using serve
            const server = http.createServer((req, res) => {
                let filePath = path.join(frontendPath, req.url === '/' ? 'index.html' : req.url);

                // Handle SPA routing by serving index.html for non-file requests
                if (!path.extname(filePath) && !filePath.includes('.')) {
                    filePath = path.join(frontendPath, 'index.html');
                }

                // Check if the file exists
                fs.access(filePath, fs.constants.F_OK, (err) => {
                    if (err) {
                        // If file doesn't exist, serve index.html (for SPA routing)
                        filePath = path.join(frontendPath, 'index.html');
                    }

                    // Read and serve the file
                    fs.readFile(filePath, (err, data) => {
                        if (err) {
                            res.writeHead(404);
                            res.end('File not found');
                            return;
                        }

                        // Set content type based on file extension
                        const ext = path.extname(filePath);
                        let contentType = 'text/html';

                        switch (ext) {
                            case '.js':
                                contentType = 'text/javascript';
                                break;
                            case '.css':
                                contentType = 'text/css';
                                break;
                            case '.json':
                                contentType = 'application/json';
                                break;
                            case '.png':
                                contentType = 'image/png';
                                break;
                            case '.jpg':
                            case '.jpeg':
                                contentType = 'image/jpeg';
                                break;
                            case '.svg':
                                contentType = 'image/svg+xml';
                                break;
                        }

                        res.writeHead(200, { 'Content-Type': contentType });
                        res.end(data);
                    });
                });
            });

            // Start the server
            frontendServer = server.listen(FRONTEND_PORT, () => {
                frontendStarted = true;
                console.log(`Frontend server started on http://localhost:${FRONTEND_PORT}`);
                resolve();
            });

            frontendServer.on('error', (err) => {
                console.error('Frontend server error:', err);
                reject(err);
            });
        } catch (err) {
            console.error('Error starting frontend server:', err);
            reject(err);
        }
    });
}

function createWindow() {
    // Don't create multiple windows
    if (win) return;

    win = new BrowserWindow({
        width: 800,
        height: 600,
        frame: true,
        maximizable: true,
        webPreferences: {
            nodeIntegration: false,  // For security, disable nodeIntegration
            preload: path.join(__dirname, "preload.js"),
            webSecurity: false, // Add this to allow loading local resources
            allowRunningInsecureContent: true // Add this to allow loading mixed content
        },
    });

    // In development, load from localhost:5173 (Vite dev server)
    if (process.env.NODE_ENV === 'development') {
        win.loadURL('http://localhost:5173');
    } else {
        // In production, load from our serve instance
        win.loadURL(`http://localhost:${FRONTEND_PORT}`);
    }


    win.maximize();

    win.on('closed', () => {
        win = null;
    });
}

ipcMain.on("print-receipt", async (event, orderData) => {
    printOrderReceipt(orderData);
});

// Add handler for getting resources path
ipcMain.on('get-resources-path', (event) => {
    // In packaged app, process.resourcesPath points to the resources directory
    // In development, we need to use a different path
    if (process.resourcesPath) {
        event.returnValue = process.resourcesPath;
    } else {
        // In development, use a relative path
        event.returnValue = path.join(__dirname, '..', 'backend', 'dist', 'report', 'reports');
    }
});

async function printOrderReceipt(orderData) {
    let win = new BrowserWindow({ show: false });

    const receiptHTML = `<html>
        <head>
            <style>
                body {
                    margin: 0;
                    padding: 0;
                    font-family: Arial, sans-serif;
                    margin-bottom:20px;
                }
                h1 {
                    margin: 0;
                    padding: 0;
                    text-align: center;
                }
                p {
                    margin: 5px 0;
                    padding: 0;
                    font-size: 16px;
                }
                ul {
                    padding: 0;
                    margin: 5px 0;
                    list-style-type: none;
                    font-size: 14px;
                    margin-top:30px;
                }
                li {
                    padding: 0;
                    margin: 0;
                    margin-top:6px;
                    font-size:1.10em;
                }
                .total {
                    font-weight: bold;
                    font-size: 20px;
                    text-align: center;
                    margin-top:30px;
                }
                    .empty{
                    margin-top:50px;
                    font-size:0.5em;
                    }
            </style>
        </head>
        <body>
            <h1>CoCo Bar</h1>
            <ul>
                ${orderData.products.map(item =>
        `<li>${item.quantity} x ${item.product.name} (${item.product.price} Den) = ${item.product.price * item.quantity} Den</li>`
    ).join("")}
            </ul>
            <p class="total"><strong>Totali:</strong> ${orderData.sumTotal} Den</p>
            <p class="empty">.</p>
        </body>
        </html>
    `;



    win.loadURL(`data:text/html,${encodeURIComponent(receiptHTML)}`);

    win.webContents.once("did-finish-load", () => {
        win.webContents.print({}, (success, errorType) => {
            if (!success) console.error("Print failed:", errorType);
            else console.log("Print successful!");
        });
    });
}

// Clean up servers on app quit
app.on('will-quit', () => {
    if (backendProcess) {
        console.log('Terminating backend process...');
        try {
            // On Windows, we need to use a different approach to kill the process
            if (process.platform === 'win32') {
                childProcess.exec(`taskkill /pid ${backendProcess.pid} /T /F`);
            } else {
                backendProcess.kill('SIGTERM');
            }
        } catch (err) {
            console.error('Error terminating backend process:', err);
        }
    }

    if (frontendServer) {
        console.log('Stopping frontend server...');
        frontendServer.close();
    }
});

// Handle window-all-closed event
app.on("window-all-closed", () => {
    if (backendProcess) {
        console.log('Terminating backend process...');
        try {
            // On Windows, we need to use a different approach to kill the process
            if (process.platform === 'win32') {
                childProcess.exec(`taskkill /pid ${backendProcess.pid} /T /F`);
            } else {
                backendProcess.kill('SIGTERM');
            }
        } catch (err) {
            console.error('Error terminating backend process:', err);
        }
        backendStarted = false;
    }
    if (process.platform !== "darwin") app.quit();
});