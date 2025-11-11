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

// Elementos DOM
const statusDot = document.getElementById('statusDot');
const statusText = document.getElementById('statusText');
const startBtn = document.getElementById('startServer');
const stopBtn = document.getElementById('stopServer');
const clearBtn = document.getElementById('clearMessages');
const tcpCountEl = document.getElementById('tcpCount');
const udpCountEl = document.getElementById('udpCount');
const totalCountEl = document.getElementById('totalCount');
const messageList = document.getElementById('messageList');
const noMessages = document.getElementById('noMessages');
const tabs = document.querySelectorAll('.message-tabs .tab');

let ws = null;
let counts = { tcp: 0, udp: 0 };
let messages = [];

function updateCounts() {
    tcpCountEl.textContent = counts.tcp;
    udpCountEl.textContent = counts.udp;
    totalCountEl.textContent = counts.tcp + counts.udp;
}

function setStatus(status) {
    if (status === 'running') {
        statusDot.classList.remove('status-offline');
        statusDot.classList.add('status-online');
        statusText.textContent = 'Servidor online';
    } else if (status === 'stopped') {
        statusDot.classList.remove('status-online');
        statusDot.classList.add('status-offline');
        statusText.textContent = 'Servidor offline';
    } else {
        statusDot.classList.remove('status-online');
        statusDot.classList.add('status-offline');
        statusText.textContent = 'Verificando status do servidor...';
    }
}

function addMessage(item) {
    // item: {protocol: 'tcp'|'udp', ip, timestamp, message}
    messages.unshift(item);
    counts[item.protocol] = (counts[item.protocol] || 0) + 1;
    renderMessages();
    updateCounts();
}

function renderMessages(filter = 'all') {
    messageList.innerHTML = '';
    const filtered = messages.filter(m => filter === 'all' ? true : m.protocol === filter);
    if (filtered.length === 0) {
        messageList.appendChild(noMessages);
        return;
    }

    filtered.forEach(m => {
        const div = document.createElement('div');
        div.classList.add('message');
        div.classList.add(m.protocol);

        const header = document.createElement('div');
        header.classList.add('message-header');
        header.innerHTML = `<span>${m.ip} — ${new Date(m.timestamp).toLocaleString()}</span><span class="protocol-badge ${m.protocol === 'tcp' ? 'tcp-badge' : 'udp-badge'}">${m.protocol.toUpperCase()}</span>`;

        const content = document.createElement('div');
        content.classList.add('message-content');
        content.textContent = m.message;

        div.appendChild(header);
        div.appendChild(content);
        messageList.appendChild(div);
    });
}

function connectWebSocket() {
    if (ws && ws.readyState === WebSocket.OPEN) return;

    logDebug(`Conectando ao WebSocket: ${websocketUrl}`);
    try {
        ws = new WebSocket(websocketUrl);
    } catch (e) {
        logDebug('Falha ao criar WebSocket: ' + e);
        setStatus('stopped');
        return;
    }

    ws.onopen = () => {
        logDebug('WebSocket conectado');
        setStatus('running');
    };

    ws.onclose = (ev) => {
        logDebug('WebSocket desconectado');
        setStatus('stopped');
    };

    ws.onerror = (err) => {
        logDebug('Erro WebSocket: ' + JSON.stringify(err));
        setStatus('stopped');
    };

    ws.onmessage = (ev) => {
        logDebug('Mensagem recebida do WebSocket');
        let payload = null;
        try {
            payload = JSON.parse(ev.data);
        } catch (e) {
            // mensagem simples
            payload = { protocol: 'tcp', ip: 'unknown', timestamp: Date.now(), message: ev.data };
        }

        // Normalize
        if (!payload.protocol) payload.protocol = 'tcp';
        if (!payload.timestamp) payload.timestamp = Date.now();
        if (!payload.ip) payload.ip = 'unknown';
        if (!payload.message && payload.msg) payload.message = payload.msg;

        addMessage(payload);
    };
}

function disconnectWebSocket() {
    if (!ws) return;
    try {
        ws.close();
    } catch (e) {
        // ignore
    }
    ws = null;
    setStatus('stopped');
}

// UI handlers
startBtn.addEventListener('click', () => {
    connectWebSocket();
});

stopBtn.addEventListener('click', () => {
    disconnectWebSocket();
});

clearBtn.addEventListener('click', () => {
    messages = [];
    counts = { tcp: 0, udp: 0 };
    updateCounts();
    renderMessages('all');
});

tabs.forEach(tab => {
    tab.addEventListener('click', () => {
        document.querySelector('.tab.active').classList.remove('active');
        tab.classList.add('active');
        const filter = tab.getAttribute('data-filter');
        renderMessages(filter);
    });
});

// Inicialização
updateCounts();
setStatus('unknown');
// Tentativa inicial de conexão automática
connectWebSocket();
