# Módulo: Simulador Visual e Data Path

O Simulador Visual é o componente gráfico principal do **MARIE Studio**. Ele fornece um ambiente de depuração em tempo real com controle de velocidade, inspeção de memória e o **Diagrama do Caminho de Dados (Data Path)** em SVG.

---

## Arquivos do Módulo

- [`src/simulator/simulatorEngine.ts`](../src/simulator/simulatorEngine.ts) — Motor de estado da CPU MARIE.
- [`src/simulator/simulatorHtml.ts`](../src/simulator/simulatorHtml.ts) — Template HTML/CSS, esquema SVG do Data Path e lógica da interface Webview.
- [`src/simulator/simulatorPanel.ts`](../src/simulator/simulatorPanel.ts) — Gerenciador da janela Webview e sincronização de destaque de linha no editor.

---

### Componentes Mapeados no SVG:

1. **Control Unit:** Exibe status dos passos (`Step`) e sinais de controle.
2. **Registradores:** `IR`, `OUT`, `IN`, `AC`, `MBR`, `PC`, `MAR`. Os valores numéricos dentro dos caixas SVG são atualizados via manipuladores de texto DOM (`svgValAC.textContent = s.acHex`).
3. **ULA (ALU):** Trapezóide conectado a `AC` e `MBR`, enviando os sinais de condição `AC < 0` e `AC = 0` para a Unidade de Controle.
4. **Main Memory:** Exibe a palavra de memória atual `M[MAR]`.

---

## Comunicação Bidirecional (VS Code <-> Webview IPC)

O envio de comandos e atualização de tela funciona via `postMessage`:

### 1. Do Webview para a Extensão (Ações do Usuário)

Quando o usuário clica em **Passo (Step)**, **Executar (Play)** ou envia dados no formulário de **INPUT**:

```javascript
vscode.postMessage({ command: "step" });
vscode.postMessage({ command: "inputProvided", value: 42 });
```

### 2. Da Extensão para o Webview (Atualização do Estado)

O `SimulatorEngine` gera um snapshot do estado (`SimulatorState`) e o envia para o Webview:

```typescript
this._panel.webview.postMessage({
  command: "updateState",
  state: this._engine.getState(message),
});
```

---

## Destaque da Linha no Editor

Sempre que o `PC` avança, o `simulatorPanel.ts` consulta a tabela `addressToLineMap` para encontrar a linha do arquivo `.mas` correspondente ao endereço atual e aplica uma decoração de destaque amarela na linha do editor:

```typescript
const range = new vscode.Range(lineIndex, 0, lineIndex, 200);
this._sourceEditor.setDecorations(MarieSimulatorPanel._decorationType, [range]);
```
