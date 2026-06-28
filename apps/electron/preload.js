const { contextBridge, ipcRenderer } = require('electron');

// Log that preload script is running
console.log('Preload script is running');

// Expose IPC methods to the renderer process securely
contextBridge.exposeInMainWorld("electron", {
    printReceipt: (orderData) => {
        console.log('Sending print-receipt event with data:', orderData);
        ipcRenderer.send('print-receipt', orderData);
    },
    // Add a method to check if the preload script is working
    ping: () => {
        console.log('Ping received from renderer');
        return 'pong';
    },
    // Add a method to get app info
    getAppInfo: () => {
        return {
            isElectron: true,
            version: process.versions.electron
        };
    },
    // Add a method to get the resources path
    getResourcesPath: () => {
        // Use synchronous IPC to get the resources path from the main process
        return ipcRenderer.sendSync('get-resources-path');
    }
});

// Log when preload script has finished
console.log('Preload script has finished loading');