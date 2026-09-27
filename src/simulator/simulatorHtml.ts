export function getHtmlForWebview(): string {
  return `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>MARIE Visual Simulator</title>
  <style>
    :root {
      --bg: #0d1117;
      --card-bg: #161b22;
      --card-border: #30363d;
      --text: #c9d1d9;
      --accent: #58a6ff;
      --green: #2ea043;
      --purple: #bc8cff;
      --yellow: #d29922;
      --red: #f85149;
    }
    body {
      font-family: system-ui, -apple-system, sans-serif;
      background-color: var(--bg);
      color: var(--text);
      margin: 0;
      padding: 16px;
      display: flex;
      flex-direction: column;
      gap: 16px;
      box-sizing: border-box;
    }
    .header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      background: linear-gradient(135deg, #1f6beb33, #a5d6ff1a);
      border: 1px solid var(--card-border);
      border-radius: 8px;
      padding: 12px 16px;
    }
    .header h2 { margin: 0; font-size: 1.25rem; color: #58a6ff; display: flex; align-items: center; gap: 8px; }
    .controls { display: flex; gap: 8px; align-items: center; }
    button {
      background: #21262d;
      color: #c9d1d9;
      border: 1px solid var(--card-border);
      padding: 6px 14px;
      border-radius: 6px;
      font-weight: 600;
      cursor: pointer;
      display: flex;
      align-items: center;
      gap: 6px;
      transition: all 0.2s;
    }
    button:hover { background: #30363d; border-color: #8b949e; }
    button.btn-primary { background: #238636; color: #fff; border-color: #2ea043; }
    button.btn-primary:hover { background: #2ea043; }
    button.btn-danger { background: #da3633; color: #fff; border-color: #f85149; }
    
    .view-tabs {
      display: flex;
      gap: 8px;
      border-bottom: 1px solid var(--card-border);
      padding-bottom: 8px;
    }
    .tab-btn {
      background: transparent;
      border: 1px solid transparent;
      color: #8b949e;
      padding: 6px 16px;
      border-radius: 6px;
      font-size: 0.85rem;
    }
    .tab-btn.active {
      background: var(--card-bg);
      border-color: var(--card-border);
      color: var(--accent);
      font-weight: bold;
    }

    .grid-container {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(130px, 1fr));
      gap: 10px;
    }
    .reg-card {
      background: var(--card-bg);
      border: 1px solid var(--card-border);
      border-radius: 8px;
      padding: 10px;
      text-align: center;
    }
    .reg-card.highlight { border-color: var(--accent); box-shadow: 0 0 8px rgba(88, 166, 255, 0.4); }
    .reg-title { font-size: 0.75rem; color: #8b949e; font-weight: 600; text-transform: uppercase; margin-bottom: 4px; }
    .reg-value { font-family: monospace; font-size: 1.2rem; font-weight: bold; color: #f0f6fc; }
    .reg-sub { font-size: 0.75rem; color: #8b949e; }

    /* Estilos do Data Path SVG */
    .datapath-card {
      background: var(--card-bg);
      border: 1px solid var(--card-border);
      border-radius: 8px;
      padding: 16px;
      display: flex;
      justify-content: center;
      align-items: center;
      overflow-x: auto;
    }
    .datapath-svg {
      width: 100%;
      max-width: 950px;
      height: auto;
    }

    .main-section { display: grid; grid-template-columns: 1fr 280px; gap: 16px; }
    @media (max-width: 768px) { .main-section { grid-template-columns: 1fr; } }

    .memory-box {
      background: var(--card-bg);
      border: 1px solid var(--card-border);
      border-radius: 8px;
      padding: 12px;
      display: flex;
      flex-direction: column;
      gap: 8px;
      max-height: 380px;
    }
    .memory-header { display: flex; justify-content: space-between; align-items: center; }
    .memory-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(75px, 1fr));
      gap: 4px;
      overflow-y: auto;
      max-height: 320px;
      padding-right: 4px;
    }
    .cell {
      background: #0d1117;
      border: 1px solid #21262d;
      border-radius: 4px;
      padding: 4px;
      text-align: center;
      font-family: monospace;
      font-size: 0.75rem;
    }
    .cell.accessed { border-color: var(--accent); background: rgba(88, 166, 255, 0.15); }
    .cell.modified { border-color: var(--green); background: rgba(46, 160, 67, 0.25); font-weight: bold; }

    .side-box { display: flex; flex-direction: column; gap: 16px; }
    .panel-card {
      background: var(--card-bg);
      border: 1px solid var(--card-border);
      border-radius: 8px;
      padding: 12px;
      display: flex;
      flex-direction: column;
      gap: 8px;
    }
    .panel-card h4 { margin: 0; font-size: 0.9rem; color: #58a6ff; }
    .console-log {
      background: #0d1117;
      border: 1px solid #21262d;
      border-radius: 6px;
      padding: 8px;
      font-family: monospace;
      font-size: 0.85rem;
      max-height: 140px;
      overflow-y: auto;
      color: #7ee787;
    }

    .status-badge {
      display: inline-block;
      padding: 2px 8px;
      border-radius: 12px;
      font-size: 0.75rem;
      font-weight: bold;
    }
    .status-ready { background: #1f6beb33; color: #58a6ff; }
    .status-running { background: #2ea04333; color: #7ee787; }
    .status-paused { background: #d2992233; color: #d29922; }
    .status-halted { background: #8b949e33; color: #8b949e; }
    .status-waiting_input { background: #bc8cff33; color: #d2a8ff; }
    .status-error { background: #f8514933; color: #ff7b72; }

    .modal {
      display: none;
      position: fixed;
      top: 0; left: 0; right: 0; bottom: 0;
      background: rgba(0,0,0,0.7);
      justify-content: center;
      align-items: center;
      z-index: 10;
    }
    .modal.active { display: flex; }
    .modal-card {
      background: var(--card-bg);
      border: 1px solid var(--accent);
      border-radius: 12px;
      padding: 20px;
      width: 300px;
      display: flex;
      flex-direction: column;
      gap: 12px;
    }
    input[type="number"], input[type="text"] {
      background: #0d1117;
      border: 1px solid var(--card-border);
      color: #fff;
      padding: 8px;
      border-radius: 6px;
      font-family: monospace;
    }
  </style>
</head>
<body>

  <div class="header">
    <h2>MARIE Visual Simulator</h2>
    <div class="controls">
      <button id="btnPlay" class="btn-primary">Executar</button>
      <button id="btnPause">Pausar</button>
      <button id="btnStep">Passo (Step)</button>
      <button id="btnReset" class="btn-danger">Reiniciar</button>
    </div>
  </div>

  <div class="view-tabs">
    <button class="tab-btn active" id="tabDatapath">Caminho de Dados (Data Path)</button>
    <button class="tab-btn" id="tabMemory">Grade de Memória RAM</button>
    <button class="tab-btn" id="tabSplit">Visão Combinada</button>
  </div>

  <div class="grid-container">
    <div class="reg-card highlight">
      <div class="reg-title">AC (Acumulador)</div>
      <div class="reg-value" id="valAC">0</div>
      <div class="reg-sub" id="subAC">0x0000</div>
    </div>
    <div class="reg-card">
      <div class="reg-title">PC (Prog Counter)</div>
      <div class="reg-value" id="valPC">000</div>
      <div class="reg-sub" id="subPC">DEC 0</div>
    </div>
    <div class="reg-card">
      <div class="reg-title">IR (Instrução)</div>
      <div class="reg-value" id="valIR">0000</div>
      <div class="reg-sub">16 Bits</div>
    </div>
    <div class="reg-card">
      <div class="reg-title">MAR (Endereço)</div>
      <div class="reg-value" id="valMAR">000</div>
      <div class="reg-sub">End. Memória</div>
    </div>
    <div class="reg-card">
      <div class="reg-title">MBR (Buffer)</div>
      <div class="reg-value" id="valMBR">0000</div>
      <div class="reg-sub">Dado Memória</div>
    </div>
    <div class="reg-card">
      <div class="reg-title">InREG / OutREG</div>
      <div class="reg-value"><span id="valIN">0</span> / <span id="valOUT">0</span></div>
      <div class="reg-sub">Entrada / Saída</div>
    </div>
  </div>

  <!-- DIAGRAMA DATA PATH SVG -->
  <div class="datapath-card" id="datapathSection">
    <svg class="datapath-svg" viewBox="0 0 950 420" xmlns="http://www.w3.org/2000/svg">
      <!-- Definições de marcadores de seta -->
      <defs>
        <marker id="arrow-blue" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
          <path d="M 0 0 L 10 5 L 0 10 z" fill="#58a6ff" />
        </marker>
        <marker id="arrow-green" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
          <path d="M 0 0 L 10 5 L 0 10 z" fill="#2ea043" />
        </marker>
        <marker id="arrow-red" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
          <path d="M 0 0 L 10 5 L 0 10 z" fill="#f85149" />
        </marker>
      </defs>

      <!-- 1. UNIDADE DE CONTROLE (Esquerda) -->
      <rect x="30" y="20" width="120" height="370" rx="8" fill="#161b22" stroke="#30363d" stroke-width="2"/>
      <text x="90" y="45" fill="#8b949e" font-size="14" font-weight="bold" text-anchor="middle">Control unit</text>
      
      <!-- Sinais de Controle -->
      <text x="140" y="70" fill="#58a6ff" font-size="12" text-anchor="end">Read</text>
      <text x="45" y="120" fill="#8b949e" font-size="11">Step</text>
      
      <!-- Pontos de Passos (Step dots) -->
      <circle cx="50" cy="140" r="4" fill="#58a6ff"/>
      <circle cx="50" cy="160" r="4" fill="#30363d"/>
      <circle cx="50" cy="180" r="4" fill="#30363d"/>
      <circle cx="50" cy="200" r="4" fill="#30363d"/>
      <circle cx="50" cy="220" r="4" fill="#30363d"/>
      <circle cx="50" cy="240" r="4" fill="#30363d"/>
      <circle cx="50" cy="260" r="4" fill="#30363d"/>
      <circle cx="50" cy="280" r="4" fill="#30363d"/>

      <!-- Condições da ULA (Entradas na Unidade de Controle) -->
      <text x="140" y="305" fill="#8b949e" font-size="11" text-anchor="end" id="svg-text-acneg">AC &lt; 0</text>
      <text x="140" y="325" fill="#8b949e" font-size="11" text-anchor="end" id="svg-text-aczero">AC = 0</text>

      <text x="140" y="365" fill="#f85149" font-size="12" text-anchor="end">Write</text>

      <!-- 2. MEMÓRIA PRINCIPAL (Direita) -->
      <rect x="800" y="20" width="120" height="370" rx="8" fill="#161b22" stroke="#30363d" stroke-width="2"/>
      <text x="860" y="45" fill="#8b949e" font-size="14" font-weight="bold" text-anchor="middle">Main memory</text>
      <text x="860" y="170" fill="#8b949e" font-size="13" text-anchor="middle">M[MAR]</text>
      <text x="860" y="200" fill="#f0f6fc" font-size="20" font-weight="bold" font-family="monospace" text-anchor="middle" id="svg-val-mmar">0000</text>

      <!-- 3. BARRAMENTOS PRINCIPAIS -->
      <!-- Read Bus (Azul - Superior) -->
      <line x1="150" y1="65" x2="800" y2="65" stroke="#58a6ff" stroke-width="2" marker-end="url(#arrow-blue)"/>

      <!-- Data Bus (Verde - Inferior Espesso) -->
      <path d="M 180 340 L 800 340" stroke="#2ea043" stroke-width="6" fill="none"/>

      <!-- Write Bus (Vermelho - Inferior) -->
      <line x1="150" y1="370" x2="800" y2="370" stroke="#f85149" stroke-width="2" marker-end="url(#arrow-red)"/>

      <!-- 4. CAIXAS DOS REGISTRADORES (Centro) -->
      <!-- IR -->
      <g id="svg-box-ir">
        <rect x="170" y="100" width="75" height="50" rx="6" fill="#0d1117" stroke="#30363d" stroke-width="2"/>
        <text x="207" y="118" fill="#8b949e" font-size="11" text-anchor="middle">IR</text>
        <text x="207" y="138" fill="#f0f6fc" font-size="14" font-family="monospace" font-weight="bold" text-anchor="middle" id="svg-val-ir">0000</text>
        <line x1="207" y1="65" x2="207" y2="100" stroke="#58a6ff" stroke-dasharray="2 2" stroke-width="1.5"/>
        <line x1="207" y1="150" x2="207" y2="340" stroke="#2ea043" stroke-width="4"/>
      </g>

      <!-- OUT -->
      <g id="svg-box-out">
        <rect x="260" y="100" width="75" height="50" rx="6" fill="#0d1117" stroke="#30363d" stroke-width="2"/>
        <text x="297" y="118" fill="#8b949e" font-size="11" text-anchor="middle">OUT</text>
        <text x="297" y="138" fill="#f0f6fc" font-size="14" font-family="monospace" font-weight="bold" text-anchor="middle" id="svg-val-out">0000</text>
        <line x1="297" y1="65" x2="297" y2="100" stroke="#58a6ff" stroke-dasharray="2 2" stroke-width="1.5"/>
        <line x1="297" y1="150" x2="297" y2="340" stroke="#2ea043" stroke-width="4"/>
      </g>

      <!-- IN -->
      <g id="svg-box-in">
        <rect x="350" y="100" width="75" height="50" rx="6" fill="#0d1117" stroke="#30363d" stroke-width="2"/>
        <text x="387" y="118" fill="#8b949e" font-size="11" text-anchor="middle">IN</text>
        <text x="387" y="138" fill="#f0f6fc" font-size="14" font-family="monospace" font-weight="bold" text-anchor="middle" id="svg-val-in">0000</text>
        <line x1="387" y1="65" x2="387" y2="100" stroke="#58a6ff" stroke-dasharray="2 2" stroke-width="1.5"/>
        <line x1="387" y1="150" x2="387" y2="340" stroke="#2ea043" stroke-width="4"/>
      </g>

      <!-- AC -->
      <g id="svg-box-ac">
        <rect x="440" y="100" width="75" height="50" rx="6" fill="#0d1117" stroke="#30363d" stroke-width="2"/>
        <text x="477" y="118" fill="#58a6ff" font-size="11" font-weight="bold" text-anchor="middle">AC</text>
        <text x="477" y="138" fill="#f0f6fc" font-size="14" font-family="monospace" font-weight="bold" text-anchor="middle" id="svg-val-ac">0000</text>
        <line x1="477" y1="65" x2="477" y2="100" stroke="#58a6ff" stroke-dasharray="2 2" stroke-width="1.5"/>
        <line x1="477" y1="150" x2="477" y2="340" stroke="#2ea043" stroke-width="4"/>
      </g>

      <!-- MBR -->
      <g id="svg-box-mbr">
        <rect x="530" y="100" width="75" height="50" rx="6" fill="#0d1117" stroke="#f85149" stroke-width="2"/>
        <text x="567" y="118" fill="#f85149" font-size="11" font-weight="bold" text-anchor="middle">MBR</text>
        <text x="567" y="138" fill="#f0f6fc" font-size="14" font-family="monospace" font-weight="bold" text-anchor="middle" id="svg-val-mbr">0000</text>
        <line x1="567" y1="65" x2="567" y2="100" stroke="#58a6ff" stroke-dasharray="2 2" stroke-width="1.5"/>
        <!-- MBR to Data Bus -->
        <line x1="567" y1="150" x2="567" y2="340" stroke="#2ea043" stroke-width="4" stroke-dasharray="4 2"/>
        <!-- MBR Write Line -->
        <line x1="595" y1="150" x2="595" y2="370" stroke="#f85149" stroke-width="2"/>
      </g>

      <!-- PC -->
      <g id="svg-box-pc">
        <rect x="620" y="100" width="75" height="50" rx="6" fill="#0d1117" stroke="#30363d" stroke-width="2"/>
        <text x="657" y="118" fill="#8b949e" font-size="11" text-anchor="middle">PC</text>
        <text x="657" y="138" fill="#f0f6fc" font-size="14" font-family="monospace" font-weight="bold" text-anchor="middle" id="svg-val-pc">000</text>
        <line x1="657" y1="65" x2="657" y2="100" stroke="#58a6ff" stroke-dasharray="2 2" stroke-width="1.5"/>
        <line x1="657" y1="150" x2="657" y2="340" stroke="#2ea043" stroke-width="4"/>
      </g>

      <!-- MAR -->
      <g id="svg-box-mar">
        <rect x="710" y="100" width="75" height="50" rx="6" fill="#0d1117" stroke="#30363d" stroke-width="2"/>
        <text x="747" y="118" fill="#8b949e" font-size="11" text-anchor="middle">MAR</text>
        <text x="747" y="138" fill="#f0f6fc" font-size="14" font-family="monospace" font-weight="bold" text-anchor="middle" id="svg-val-mar">000</text>
        <line x1="747" y1="65" x2="747" y2="100" stroke="#58a6ff" stroke-dasharray="2 2" stroke-width="1.5"/>
        <line x1="747" y1="150" x2="747" y2="340" stroke="#2ea043" stroke-width="4"/>
        <!-- MAR output to Main Memory address port -->
        <line x1="785" y1="125" x2="800" y2="125" stroke="#2ea043" stroke-width="2" marker-end="url(#arrow-green)"/>
      </g>

      <!-- 5. ULA (ALU Trapezóide) -->
      <g id="svg-box-alu">
        <polygon points="485,210 555,210 535,255 505,255" fill="#161b22" stroke="#58a6ff" stroke-width="2"/>
        <text x="520" y="235" fill="#58a6ff" font-size="11" font-weight="bold" text-anchor="middle">ALU</text>
        <text x="500" y="222" fill="#8b949e" font-size="9">+</text>
        <text x="540" y="222" fill="#8b949e" font-size="9">-</text>

        <!-- Linha AC -> ULA -->
        <line x1="490" y1="150" x2="490" y2="210" stroke="#2ea043" stroke-width="2" marker-end="url(#arrow-green)"/>
        <!-- Linha MBR -> ULA -->
        <line x1="550" y1="150" x2="550" y2="210" stroke="#2ea043" stroke-width="2" marker-end="url(#arrow-green)"/>

        <!-- Linhas de Condição ULA -> Control Unit -->
        <path d="M 505 245 L 150 245" stroke="#8b949e" stroke-width="1.5" stroke-dasharray="3 3"/>
        <path d="M 505 250 L 150 250" stroke="#8b949e" stroke-width="1.5" stroke-dasharray="3 3"/>
      </g>

    </svg>
  </div>

  <div class="main-section" id="memorySection">
    <div class="memory-box">
      <div class="memory-header">
        <h4 style="margin:0; color:#58a6ff;">Memória RAM (4096 Palavras)</h4>
        <div>
          Ir para: <input type="text" id="jumpAddr" placeholder="000" style="width:50px;">
        </div>
      </div>
      <div class="memory-grid" id="memoryGrid"></div>
    </div>

    <div class="side-box">
      <div class="panel-card" id="inputPanelCard">
        <h4>Entrada de Dados (INPUT)</h4>
        <div style="display: flex; gap: 8px;">
          <input type="number" id="panelInputNumber" placeholder="Ex: 42" style="flex:1;">
          <button id="btnSubmitPanelInput" class="btn-primary">Enviar</button>
        </div>
        <div style="font-size:0.75rem; color:#8b949e;" id="inputNotice">Digite um número inteiro e clique em Enviar.</div>
      </div>

      <div class="panel-card">
        <h4>Status de Execução</h4>
        <div>Status: <span id="statusBadge" class="status-badge status-ready">PRONTO</span></div>
        <div>Passos: <strong id="valSteps">0</strong></div>
        <div style="margin-top: 8px;">
          Velocidade:
          <input type="range" id="speedSlider" min="50" max="1000" value="300">
          <span id="speedVal">300ms</span>
        </div>
      </div>

      <div class="panel-card">
        <h4>Console de Saída (OUTPUT)</h4>
        <div class="console-log" id="consoleLog">Esperando execução...</div>
      </div>
    </div>
  </div>

  <div class="modal" id="inputModal">
    <div class="modal-card">
      <h3 style="margin:0; color:#58a6ff;">Entrada de Dados (INPUT)</h3>
      <p style="margin:0; font-size:0.85rem;">Digite um valor inteiro de 16 bits (-32768 a 32767):</p>
      <input type="number" id="inputNumber" placeholder="Ex: 42" autofocus>
      <button id="btnSubmitInput" class="btn-primary">Enviar para o AC</button>
    </div>
  </div>

  <script>
    const vscode = acquireVsCodeApi();

    let isAutoRunning = false;
    let timerId = null;

    const valAC = document.getElementById('valAC');
    const subAC = document.getElementById('subAC');
    const valPC = document.getElementById('valPC');
    const subPC = document.getElementById('subPC');
    const valIR = document.getElementById('valIR');
    const valMAR = document.getElementById('valMAR');
    const valMBR = document.getElementById('valMBR');
    const valIN = document.getElementById('valIN');
    const valOUT = document.getElementById('valOUT');
    const valSteps = document.getElementById('valSteps');
    const statusBadge = document.getElementById('statusBadge');
    const consoleLog = document.getElementById('consoleLog');
    const memoryGrid = document.getElementById('memoryGrid');
    const inputModal = document.getElementById('inputModal');
    const inputNumber = document.getElementById('inputNumber');
    const speedSlider = document.getElementById('speedSlider');
    const speedVal = document.getElementById('speedVal');

    // SVG Text Elements
    const svgValIR = document.getElementById('svg-val-ir');
    const svgValOUT = document.getElementById('svg-val-out');
    const svgValIN = document.getElementById('svg-val-in');
    const svgValAC = document.getElementById('svg-val-ac');
    const svgValMBR = document.getElementById('svg-val-mbr');
    const svgValPC = document.getElementById('svg-val-pc');
    const svgValMAR = document.getElementById('svg-val-mar');
    const svgValMMAR = document.getElementById('svg-val-mmar');
    const svgTextAcNeg = document.getElementById('svg-text-acneg');
    const svgTextAcZero = document.getElementById('svg-text-aczero');

    // Abas de visualização
    const tabDatapath = document.getElementById('tabDatapath');
    const tabMemory = document.getElementById('tabMemory');
    const tabSplit = document.getElementById('tabSplit');

    const datapathSection = document.getElementById('datapathSection');
    const memorySection = document.getElementById('memorySection');

    tabDatapath.addEventListener('click', () => {
      tabDatapath.className = 'tab-btn active';
      tabMemory.className = 'tab-btn';
      tabSplit.className = 'tab-btn';
      datapathSection.style.display = 'flex';
      memorySection.style.display = 'none';
    });

    tabMemory.addEventListener('click', () => {
      tabDatapath.className = 'tab-btn';
      tabMemory.className = 'tab-btn active';
      tabSplit.className = 'tab-btn';
      datapathSection.style.display = 'none';
      memorySection.style.display = 'grid';
    });

    tabSplit.addEventListener('click', () => {
      tabDatapath.className = 'tab-btn';
      tabMemory.className = 'tab-btn';
      tabSplit.className = 'tab-btn active';
      datapathSection.style.display = 'flex';
      memorySection.style.display = 'grid';
    });

    speedSlider.addEventListener('input', (e) => {
      speedVal.innerText = e.target.value + 'ms';
    });

    document.getElementById('btnStep').addEventListener('click', () => {
      stopAutoRun();
      vscode.postMessage({ command: 'step' });
    });

    document.getElementById('btnReset').addEventListener('click', () => {
      stopAutoRun();
      vscode.postMessage({ command: 'reset' });
    });

    document.getElementById('btnPlay').addEventListener('click', () => {
      if (!isAutoRunning) {
        isAutoRunning = true;
        document.getElementById('btnPlay').innerText = 'Rodando...';
        runLoop();
      }
    });

    document.getElementById('btnPause').addEventListener('click', () => {
      stopAutoRun();
    });

    function stopAutoRun() {
      isAutoRunning = false;
      document.getElementById('btnPlay').innerText = 'Executar';
      if (timerId) clearTimeout(timerId);
    }

    function runLoop() {
      if (!isAutoRunning) return;
      vscode.postMessage({ command: 'step' });
      const delay = parseInt(speedSlider.value, 10);
      timerId = setTimeout(runLoop, delay);
    }

    document.getElementById('btnSubmitInput').addEventListener('click', submitInput);
    inputNumber.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') submitInput();
    });

    const panelInputNumber = document.getElementById('panelInputNumber');
    const btnSubmitPanelInput = document.getElementById('btnSubmitPanelInput');
    const inputPanelCard = document.getElementById('inputPanelCard');

    function submitPanelInput() {
      const val = panelInputNumber.value;
      if (val !== '') {
        inputModal.classList.remove('active');
        vscode.postMessage({ command: 'inputProvided', value: val });
        panelInputNumber.value = '';
      }
    }

    btnSubmitPanelInput.addEventListener('click', submitPanelInput);
    panelInputNumber.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') submitPanelInput();
    });

    function submitInput() {
      const val = inputNumber.value;
      if (val !== '') {
        inputModal.classList.remove('active');
        vscode.postMessage({ command: 'inputProvided', value: val });
        inputNumber.value = '';
      }
    }

    document.getElementById('jumpAddr').addEventListener('change', (e) => {
      const addrHex = e.target.value.trim().toUpperCase();
      const addrDec = parseInt(addrHex, 16);
      if (!isNaN(addrDec)) {
        const el = document.getElementById('cell-' + addrDec);
        if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    });

    // Renderiza grid de memória
    function initMemoryGrid() {
      memoryGrid.innerHTML = '';
      for (let i = 0; i < 256; i++) {
        const cell = document.createElement('div');
        cell.className = 'cell';
        cell.id = 'cell-' + i;
        const hexAddr = i.toString(16).toUpperCase().padStart(3, '0');
        cell.innerHTML = '<span style="color:#58a6ff;">' + hexAddr + '</span><br><span id="hex-' + i + '">0000</span>';
        memoryGrid.appendChild(cell);
      }
    }

    initMemoryGrid();

    window.addEventListener('message', event => {
      const msg = event.data;
      if (msg.command === 'updateState') {
        const s = msg.state;
        valAC.innerText = s.ac;
        subAC.innerText = '0x' + s.acHex;
        valPC.innerText = s.pc;
        subPC.innerText = 'DEC ' + s.pcDec;
        valIR.innerText = s.ir;
        valMAR.innerText = s.mar;
        valMBR.innerText = s.mbr;
        valIN.innerText = s.inReg;
        valOUT.innerText = s.outReg;
        valSteps.innerText = s.steps;

        // Atualiza SVG Data Path
        svgValIR.textContent = s.ir;
        svgValOUT.textContent = s.outReg.toString(16).toUpperCase().padStart(4, '0');
        svgValIN.textContent = s.inReg.toString(16).toUpperCase().padStart(4, '0');
        svgValAC.textContent = s.acHex;
        svgValMBR.textContent = s.mbr;
        svgValPC.textContent = s.pc;
        svgValMAR.textContent = s.mar;
        svgValMMAR.textContent = s.mMarHex;

        if (s.acIsNegative) {
          svgTextAcNeg.setAttribute('fill', '#58a6ff');
          svgTextAcNeg.setAttribute('font-weight', 'bold');
        } else {
          svgTextAcNeg.setAttribute('fill', '#8b949e');
          svgTextAcNeg.setAttribute('font-weight', 'normal');
        }

        if (s.acIsZero) {
          svgTextAcZero.setAttribute('fill', '#58a6ff');
          svgTextAcZero.setAttribute('font-weight', 'bold');
        } else {
          svgTextAcZero.setAttribute('fill', '#8b949e');
          svgTextAcZero.setAttribute('font-weight', 'normal');
        }

        statusBadge.innerText = s.status.toUpperCase();
        statusBadge.className = 'status-badge status-' + s.status;

        if (s.status === 'halted' || s.status === 'error' || s.status === 'waiting_input') {
          stopAutoRun();
        }

        if (s.status === 'waiting_input') {
          inputModal.classList.add('active');
          inputNumber.focus();
          if (inputPanelCard) {
            inputPanelCard.style.borderColor = '#bc8cff';
            inputPanelCard.style.boxShadow = '0 0 10px rgba(188, 140, 255, 0.4)';
          }
          if (panelInputNumber) panelInputNumber.focus();
        } else {
          if (inputPanelCard) {
            inputPanelCard.style.borderColor = '#30363d';
            inputPanelCard.style.boxShadow = 'none';
          }
        }

        if (s.output && s.output.length > 0) {
          consoleLog.innerText = s.output.map(o => '> ' + o).join('\\n');
        } else {
          consoleLog.innerText = s.logMessage || 'Sem saídas ainda.';
        }

        // Atualiza células de memória
        for (let i = 0; i < 256; i++) {
          const hexVal = s.memory[i] || '0000';
          const el = document.getElementById('hex-' + i);
          const cell = document.getElementById('cell-' + i);
          if (el) el.innerText = hexVal;

          if (cell) {
            cell.classList.remove('accessed', 'modified');
            if (i === s.lastModified) cell.classList.add('modified');
            else if (i === s.lastAccessed) cell.classList.add('accessed');
          }
        }
      }
    });
  </script>
</body>
</html>`;
}
