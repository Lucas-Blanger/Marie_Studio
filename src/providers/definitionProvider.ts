import * as vscode from "vscode";
import { assemble } from "../assembler/assembler";

export class MarieDefinitionProvider implements vscode.DefinitionProvider {
  provideDefinition(
    document: vscode.TextDocument,
    position: vscode.Position,
  ): vscode.ProviderResult<vscode.Definition> {
    const range = document.getWordRangeAtPosition(position);
    if (!range) {
      return null;
    }

    const word = document.getText(range).trim();
    const assembly = assemble(document.getText());

    const symbol = assembly.symbols.find((s) => s.name === word);
    if (!symbol) {
      return null;
    }

    const targetLineIndex = Math.max(0, symbol.lineNumber - 1);
    const lineText = document.lineAt(targetLineIndex).text;
    const startCol = symbol.startColumn ?? lineText.indexOf(symbol.name);
    const endCol = symbol.endColumn ?? startCol + symbol.name.length;

    const targetPos = new vscode.Position(targetLineIndex, Math.max(0, startCol));
    const targetRange = new vscode.Range(
      targetPos,
      new vscode.Position(targetLineIndex, Math.max(startCol + 1, endCol)),
    );

    return new vscode.Location(document.uri, targetRange);
  }
}
