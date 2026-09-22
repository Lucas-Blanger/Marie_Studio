import * as vscode from "vscode";
import { OPCODES, DIRECTIVES } from "../assembler/instructions";
import { assemble } from "../assembler/assembler";

export class MarieCompletionProvider
  implements vscode.CompletionItemProvider
{
  provideCompletionItems(
    document: vscode.TextDocument,
    position: vscode.Position,
  ): vscode.ProviderResult<
    vscode.CompletionItem[] | vscode.CompletionList<vscode.CompletionItem>
  > {
    const items: vscode.CompletionItem[] = [];

    const lineText = document.lineAt(position.line).text;
    const lineUntilPos = lineText.substring(0, position.character).trim();

    // Se estiver após SKIPCOND, sugere 000, 400, 800
    if (/SKIPCOND\s+$/i.test(lineUntilPos)) {
      items.push(
        this.createCompletion(
          "000",
          "AC < 0",
          "Pula próxima instrução se o Acumulador for negativo",
          vscode.CompletionItemKind.Value,
        ),
        this.createCompletion(
          "400",
          "AC = 0",
          "Pula próxima instrução se o Acumulador for zero",
          vscode.CompletionItemKind.Value,
        ),
        this.createCompletion(
          "800",
          "AC > 0",
          "Pula próxima instrução se o Acumulador for estritamente positivo",
          vscode.CompletionItemKind.Value,
        ),
      );
      return items;
    }

    // Sugere instruções do MARIE
    for (const opcode of Object.keys(OPCODES)) {
      const item = new vscode.CompletionItem(
        opcode,
        vscode.CompletionItemKind.Keyword,
      );
      item.detail = `Instrução MARIE (Opcode ${OPCODES[opcode]})`;
      item.insertText = opcode;
      items.push(item);
    }

    // Sugere diretivas de dados
    for (const dir of DIRECTIVES) {
      const item = new vscode.CompletionItem(
        dir,
        vscode.CompletionItemKind.Constant,
      );
      item.detail = `Diretiva de Dados MARIE (${dir})`;
      item.insertText = dir + " ";
      items.push(item);
    }

    // Sugere rótulos (labels) declarados no arquivo
    const assembly = assemble(document.getText());
    for (const symbol of assembly.symbols) {
      const item = new vscode.CompletionItem(
        symbol.name,
        vscode.CompletionItemKind.Variable,
      );
      item.detail = `Label (Endereço 0x${symbol.address.toString(16).toUpperCase().padStart(3, "0")})`;
      item.documentation = `Definido na linha ${symbol.lineNumber}`;
      items.push(item);
    }

    return items;
  }

  private createCompletion(
    label: string,
    detail: string,
    doc: string,
    kind: vscode.CompletionItemKind,
  ): vscode.CompletionItem {
    const item = new vscode.CompletionItem(label, kind);
    item.detail = detail;
    item.documentation = doc;
    return item;
  }
}
