import * as vscode from "vscode";
import { assemble, AssembleResult } from "../assembler/assembler";
import { SimulatorEngine } from "./simulatorEngine";
import { getHtmlForWebview } from "./simulatorHtml";

export class MarieSimulatorPanel {
  public static currentPanel: MarieSimulatorPanel | undefined;
  private readonly _panel: vscode.WebviewPanel;
  private readonly _extensionUri: vscode.Uri;
  private _disposables: vscode.Disposable[] = [];

  private _engine: SimulatorEngine = new SimulatorEngine();
  private _assemblyResult?: AssembleResult;
  private _sourceEditor?: vscode.TextEditor;

  private static _decorationType = vscode.window.createTextEditorDecorationType({
    backgroundColor: "rgba(255, 200, 0, 0.25)",
    isWholeLine: true,
    border: "1px solid rgba(255, 200, 0, 0.6)",
  });

  public static createOrShow(extensionUri: vscode.Uri) {
    const editor = vscode.window.activeTextEditor;
    if (!editor || editor.document.languageId !== "marie") {
      vscode.window.showErrorMessage(
        "Abra um arquivo MARIE Assembly (.mas) antes de iniciar o simulador.",
      );
      return;
    }

    const column = vscode.window.activeTextEditor
      ? vscode.window.activeTextEditor.viewColumn
      : undefined;

    if (MarieSimulatorPanel.currentPanel) {
      MarieSimulatorPanel.currentPanel._panel.reveal(column);
      MarieSimulatorPanel.currentPanel.loadEditor(editor);
      return;
    }

    const panel = vscode.window.createWebviewPanel(
      "marieSimulator",
      "MARIE Visual Simulator",
      column || vscode.ViewColumn.One,
      {
        enableScripts: true,
        retainContextWhenHidden: true,
        localResourceRoots: [vscode.Uri.joinPath(extensionUri, "out")],
      },
    );

    MarieSimulatorPanel.currentPanel = new MarieSimulatorPanel(
      panel,
      extensionUri,
      editor,
    );
  }

  private constructor(
    panel: vscode.WebviewPanel,
    extensionUri: vscode.Uri,
    editor: vscode.TextEditor,
  ) {
    this._panel = panel;
    this._extensionUri = extensionUri;

    this._panel.onDidDispose(() => this.dispose(), null, this._disposables);

    this._panel.webview.onDidReceiveMessage(
      async (message) => {
        switch (message.command) {
          case "step":
            await this.step();
            break;
          case "reset":
            this.reset();
            break;
          case "inputProvided":
            await this.handleInput(message.value);
            break;
        }
      },
      null,
      this._disposables,
    );

    this.loadEditor(editor);
  }

  public loadEditor(editor: vscode.TextEditor) {
    this._sourceEditor = editor;
    const source = editor.document.getText();
    this._assemblyResult = assemble(source);

    if (this._assemblyResult.errors.length > 0) {
      vscode.window.showWarningMessage(
        "O arquivo possui erros de montagem. Corrija-os para simular com precisão.",
      );
    }

    this.reset();
  }

  private reset() {
    if (this._assemblyResult) {
      this._engine.loadAssembly(this._assemblyResult);
    }
    this._panel.webview.html = getHtmlForWebview();
    this.highlightCurrentLine();
    this.sendStateToWebview();
  }

  private async step(): Promise<boolean> {
    let logMsg = "";
    const success = this._engine.step((msg) => {
      logMsg = msg;
    });

    this.highlightCurrentLine();
    this.sendStateToWebview(logMsg);
    return success;
  }

  private async handleInput(valueStr: string) {
    const value = parseInt(valueStr, 10);
    if (isNaN(value)) {
      vscode.window.showErrorMessage("Por favor, digite um número inteiro válido.");
      return;
    }

    this._engine.handleInput(value);
    this.highlightCurrentLine();
    this.sendStateToWebview(`INPUT recebido: ${value}`);
  }

  private highlightCurrentLine() {
    if (!this._sourceEditor || !this._assemblyResult) return;

    const currentPc = this._engine.pc;
    const status = this._engine.status;

    const targetAddr =
      status === "running" || status === "paused" || status === "waiting_input"
        ? Math.max(0, currentPc - 1)
        : currentPc;

    const mapItem = this._assemblyResult.addressToLineMap.find(
      (item) => item.address === targetAddr,
    );

    if (mapItem) {
      const lineIndex = Math.max(0, mapItem.lineNumber - 1);
      const range = new vscode.Range(lineIndex, 0, lineIndex, 200);
      this._sourceEditor.setDecorations(MarieSimulatorPanel._decorationType, [range]);
      this._sourceEditor.revealRange(range, vscode.TextEditorRevealType.InCenterIfOutsideViewport);
    } else {
      this._sourceEditor.setDecorations(MarieSimulatorPanel._decorationType, []);
    }
  }

  private sendStateToWebview(message?: string) {
    this._panel.webview.postMessage({
      command: "updateState",
      state: this._engine.getState(message),
    });
  }

  public dispose() {
    MarieSimulatorPanel.currentPanel = undefined;
    if (this._sourceEditor) {
      this._sourceEditor.setDecorations(MarieSimulatorPanel._decorationType, []);
    }
    this._panel.dispose();
    while (this._disposables.length) {
      const x = this._disposables.pop();
      if (x) x.dispose();
    }
  }
}
