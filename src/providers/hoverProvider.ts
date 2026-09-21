import * as vscode from "vscode";
import { assemble } from "../assembler/assembler";

const INSTRUCTION_DOCS: Record<
  string,
  { summary: string; opcode: string; operation: string }
> = {
  JNS: {
    summary: "Desvio e armazenamento do endereço da instrução (Subrotina)",
    opcode: "0",
    operation: "M[X] ← PC, PC ← X + 1",
  },
  LOAD: {
    summary: "Carrega o conteúdo do endereço de memória X para o AC",
    opcode: "1",
    operation: "AC ← M[X]",
  },
  STORE: {
    summary: "Armazena o conteúdo do AC no endereço de memória X",
    opcode: "2",
    operation: "M[X] ← AC",
  },
  ADD: {
    summary: "Soma o conteúdo do endereço de memória X ao AC",
    opcode: "3",
    operation: "AC ← AC + M[X]",
  },
  SUBT: {
    summary: "Subtrai o conteúdo do endereço de memória X do AC",
    opcode: "4",
    operation: "AC ← AC - M[X]",
  },
  INPUT: {
    summary: "Lê um valor do teclado para o AC",
    opcode: "5",
    operation: "AC ← InREG",
  },
  OUTPUT: {
    summary: "Exibe o valor do AC na saída",
    opcode: "6",
    operation: "OutREG ← AC",
  },
  HALT: {
    summary: "Interrompe a execução do programa",
    opcode: "7",
    operation: "Parar execução da CPU",
  },
  SKIPCOND: {
    summary: "Pula a próxima instrução com base em uma condição",
    opcode: "8",
    operation: "Pula próxima instrução se (000: AC < 0, 400: AC = 0, 800: AC > 0)",
  },
  JUMP: {
    summary: "Desvio incondicional para o endereço X",
    opcode: "9",
    operation: "PC ← X",
  },
  CLEAR: {
    summary: "Zera o Acumulador (define AC como 0)",
    opcode: "A",
    operation: "AC ← 0",
  },
  ADDI: {
    summary: "Soma indireta: soma o conteúdo apontado por X ao AC",
    opcode: "B",
    operation: "AC ← AC + M[M[X]]",
  },
  JUMPI: {
    summary: "Desvio indireto: desvia para o endereço armazenado em X",
    opcode: "C",
    operation: "PC ← M[X]",
  },
  DEC: {
    summary: "Diretiva de dados: inteiro decimal (16 bits)",
    opcode: "—",
    operation: "Reserva palavra de memória com valor decimal",
  },
  HEX: {
    summary: "Diretiva de dados: inteiro hexadecimal (16 bits)",
    opcode: "—",
    operation: "Reserva palavra de memória com valor hexadecimal",
  },
};

export class MarieHoverProvider implements vscode.HoverProvider {
  provideHover(
    document: vscode.TextDocument,
    position: vscode.Position,
  ): vscode.ProviderResult<vscode.Hover> {
    const range = document.getWordRangeAtPosition(position);
    if (!range) {
      return null;
    }

    const word = document.getText(range).trim();
    const upperWord = word.toUpperCase();

    // 1. Verifica se é uma instrução/diretiva
    if (INSTRUCTION_DOCS[upperWord]) {
      const info = INSTRUCTION_DOCS[upperWord];
      const markdown = new vscode.MarkdownString();
      markdown.appendMarkdown(`**MARIE:** \`${upperWord}\`\n\n`);
      markdown.appendMarkdown(`${info.summary}\n\n`);
      markdown.appendMarkdown(`- **Opcode:** \`${info.opcode}\`\n`);
      markdown.appendMarkdown(`- **Operação:** \`${info.operation}\`\n`);
      return new vscode.Hover(markdown, range);
    }

    // 2. Verifica se é um rótulo (label)
    const assembly = assemble(document.getText());
    const symbol = assembly.symbols.find((s) => s.name === word);

    if (symbol) {
      const hexAddr = symbol.address.toString(16).toUpperCase().padStart(3, "0");
      const markdown = new vscode.MarkdownString();
      markdown.appendMarkdown(`**Label MARIE:** \`${symbol.name}\`\n\n`);
      markdown.appendMarkdown(`- **Endereço de Memória:** \`0x${hexAddr}\` (DEC ${symbol.address})\n`);
      markdown.appendMarkdown(`- **Definido na linha:** ${symbol.lineNumber}\n`);
      return new vscode.Hover(markdown, range);
    }

    return null;
  }
}
