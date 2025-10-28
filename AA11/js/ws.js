// Depuração
const debugInfo = document.getElementById('debugInfo');
const debugToggle = document.getElementById('debugToggle');
let debugMode = false;

// URL para o gerenciador do servidor
const managerUrl = '/py/server_manager.py';

// Define o websocket (ws)
const websocketUrl = `ws://${window.location.hostname}:8082`; // URL para o WebSocket

debugToggle.addEventListener('click', () => {
    debugMode = !debugMode;
    debugInfo.style.display = debugMode ? 'block' : 'none';
    debugToggle.textContent = debugMode ? 'Ocultar Informações de Depuração' : 'Exibir Informações de Depuração';
});

function logDebug(message) {
    const now = new Date().toISOString();
    debugInfo.innerHTML += `[${now}] ${message}\n`;
    debugInfo.scrollTop = debugInfo.scrollHeight;
    console.log(`[DEBUG] ${message}`);
}

// Implemente o restante...
