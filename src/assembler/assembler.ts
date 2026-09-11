import { OPCODES, NO_OPERAND_INSTRUCTIONS } from "./instructions";
import { parseLine, ParsedLine } from "./parser";

export interface AssembleResult {
  hex: string[];
  errors: string[];
  symbolTable: Record<string, number>;
}

/**
 * Monta um programa MARIE Assembly em código de máquina hexadecimal (16 bits).
 * Implementação clássica de montador de 2 passagens.
 */
export function assemble(source: string): AssembleResult {
  const rawLines = source.split("\n");
  const errors: string[] = [];
  const symbolTable: Record<string, number> = {};
  const parsedLines: ParsedLine[] = [];

  //  1ª passagem: monta a tabela de símbolos
  let address = 0;
  for (let i = 0; i < rawLines.length; i++) {
    const parsed = parseLine(rawLines[i], i + 1);

    // Linha vazia ou só comentário: ignora
    if (!parsed.instruction) {
      continue;
    }

    if (parsed.label) {
      if (symbolTable[parsed.label] !== undefined) {
        errors.push(
          `Linha ${parsed.lineNumber}: label "${parsed.label}" já foi definida antes.`,
        );
      }
      symbolTable[parsed.label] = address;
    }

    parsedLines.push(parsed);
    address++;
  }

  //  2ª passagem: gera o código de máquina
  const hex: string[] = [];
  address = 0;

  for (const parsed of parsedLines) {
    const instruction = parsed.instruction as string;
    let word: string;

    if (instruction === "DEC") {
      const value = parseInt(parsed.operand ?? "0", 10);
      if (isNaN(value)) {
        errors.push(
          `Linha ${parsed.lineNumber}: valor inválido em DEC ("${parsed.operand}").`,
        );
        word = "????";
      } else {
        word = toHexWord(value);
      }
    } else if (instruction === "HEX") {
      const value = parseInt(parsed.operand ?? "0", 16);
      if (isNaN(value)) {
        errors.push(
          `Linha ${parsed.lineNumber}: valor inválido em HEX ("${parsed.operand}").`,
        );
        word = "????";
      } else {
        word = toHexWord(value);
      }
    } else if (OPCODES[instruction] !== undefined) {
      const opcode = OPCODES[instruction];
      let operandBits = "000";

      if (instruction === "SKIPCOND") {
        // SKIPCOND usa o próprio valor (000, 400 ou 800) como operando, não um endereço
        const value = parseInt(parsed.operand ?? "0", 16);
        if (isNaN(value)) {
          errors.push(
            `Linha ${parsed.lineNumber}: condição inválida em SKIPCOND ("${parsed.operand}").`,
          );
        } else {
          operandBits = value.toString(16).toUpperCase().padStart(3, "0");
        }
      } else if (!NO_OPERAND_INSTRUCTIONS.includes(instruction)) {
        if (parsed.operand === undefined) {
          errors.push(
            `Linha ${parsed.lineNumber}: instrução "${instruction}" requer um operando.`,
          );
        } else {
          const target = symbolTable[parsed.operand];
          if (target === undefined) {
            errors.push(
              `Linha ${parsed.lineNumber}: label "${parsed.operand}" não foi encontrada.`,
            );
          } else {
            operandBits = target.toString(16).toUpperCase().padStart(3, "0");
          }
        }
      }

      word = opcode + operandBits;
    } else {
      errors.push(
        `Linha ${parsed.lineNumber}: instrução desconhecida "${instruction}".`,
      );
      word = "????";
    }

    const addrLabel = address.toString(16).toUpperCase().padStart(3, "0");
    hex.push(`${addrLabel}: ${word}`);
    address++;
  }

  return { hex, errors, symbolTable };
}

// Converte um número (positivo ou negativo) em palavra hex de 16 bits, complemento de dois.
function toHexWord(value: number): string {
  const unsigned = value < 0 ? 0x10000 + value : value;
  return unsigned.toString(16).toUpperCase().padStart(4, "0");
}
