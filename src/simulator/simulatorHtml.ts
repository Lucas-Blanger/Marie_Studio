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

  <div class="main-section">
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

        statusBadge.innerText = s.status.toUpperCase();
        statusBadge.className = 'status-badge status-' + s.status;

        if (s.status === 'halted' || s.status === 'error' || s.status === 'waiting_input') {
          stopAutoRun();
        }

        if (s.status === 'waiting_input') {
          inputModal.classList.add('active');
          inputNumber.focus();
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
