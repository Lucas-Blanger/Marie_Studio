import * as vscode from "vscode";
import { assemble } from "../assembler/assembler";

export function registerDiagnostics(
  context: vscode.ExtensionContext,
): vscode.DiagnosticCollection {
  const diagnosticCollection =
    vscode.languages.createDiagnosticCollection("marie");
  context.subscriptions.push(diagnosticCollection);

  function updateDiagnostics(document: vscode.TextDocument) {
    if (document.languageId !== "marie") {
      return;
    }

    const result = assemble(document.getText());
    const diagnostics: vscode.Diagnostic[] = [];

    for (const err of result.structuredErrors) {
      const lineIndex = Math.max(0, err.lineNumber - 1);
      const lineText = document.lineAt(lineIndex).text;

      const startCol = err.startColumn ?? 0;
      const endCol = err.endColumn ?? lineText.length;

      const range = new vscode.Range(
        new vscode.Position(lineIndex, startCol),
        new vscode.Position(lineIndex, Math.max(startCol + 1, endCol)),
      );

      const diagnostic = new vscode.Diagnostic(
        range,
        err.message,
        vscode.DiagnosticSeverity.Error,
      );
      diagnostic.source = "MARIE Assembler";
      diagnostics.push(diagnostic);
    }

    diagnosticCollection.set(document.uri, diagnostics);
  }

  // Eventos de atualização
  if (vscode.window.activeTextEditor) {
    updateDiagnostics(vscode.window.activeTextEditor.document);
  }

  context.subscriptions.push(
    vscode.window.onDidChangeActiveTextEditor((editor) => {
      if (editor) {
        updateDiagnostics(editor.document);
      }
    }),
  );

  context.subscriptions.push(
    vscode.workspace.onDidChangeTextDocument((event) => {
      updateDiagnostics(event.document);
    }),
  );

  context.subscriptions.push(
    vscode.workspace.onDidCloseTextDocument((doc) => {
      diagnosticCollection.delete(doc.uri);
    }),
  );

  return diagnosticCollection;
}
