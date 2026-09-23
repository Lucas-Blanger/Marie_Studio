import { OPCODES, NO_OPERAND_INSTRUCTIONS } from "./instructions";
import { parseLine, ParsedLine } from "./parser";

export interface AssemblyError {
  lineNumber: number;
  message: string;
  startColumn?: number;
  endColumn?: number;
}

export interface SymbolInfo {
  name: string;
  address: number;
  lineNumber: number;
  startColumn?: number;
  endColumn?: number;
}

export interface AddressLineMap {
  address: number;
  lineNumber: number;
  raw: string;
}

export interface AssembleResult {
  hex: string[];
  errors: string[];
  structuredErrors: AssemblyError[];
  symbolTable: Record<string, number>;
  symbols: SymbolInfo[];
  addressToLineMap: AddressLineMap[];
  parsedLines: ParsedLine[];
}

/**
 * Monta um programa MARIE Assembly em código de máquina hexadecimal (16 bits).
 * Implementação clássica de montador de 2 passagens.
 */
export function assemble(source: string): AssembleResult {
  const rawLines = source.split("\n");
  const errors: string[] = [];
  const structuredErrors: AssemblyError[] = [];
  const symbolTable: Record<string, number> = {};
  const symbols: SymbolInfo[] = [];
  const addressToLineMap: AddressLineMap[] = [];
  const parsedLines: ParsedLine[] = [];

  function addError(
    lineNumber: number,
    message: string,
    startColumn?: number,
    endColumn?: number,
  ) {
    errors.push(`Linha ${lineNumber}: ${message}`);
    structuredErrors.push({
      lineNumber,
      message,
      startColumn,
      endColumn,
    });
  }

  //  1ª passagem: monta a tabela de símbolos
  let address = 0;
  for (let i = 0; i < rawLines.length; i++) {
    const parsed = parseLine(rawLines[i], i + 1);

    // Linha vazia ou só comentário: ignora
    if (!parsed.instruction) {
      if (parsed.label) {
        addError(
          parsed.lineNumber,
          `Label "${parsed.label}" sem instrução associada.`,
          parsed.labelRange?.startColumn,
          parsed.labelRange?.endColumn,
        );
      }
      continue;
    }

    if (parsed.label) {
      if (symbolTable[parsed.label] !== undefined) {
        addError(
          parsed.lineNumber,
          `label "${parsed.label}" já foi definida antes.`,
          parsed.labelRange?.startColumn,
          parsed.labelRange?.endColumn,
        );
      } else {
        symbolTable[parsed.label] = address;
        symbols.push({
          name: parsed.label,
          address,
          lineNumber: parsed.lineNumber,
          startColumn: parsed.labelRange?.startColumn,
          endColumn: parsed.labelRange?.endColumn,
        });
      }
    }

    parsedLines.push(parsed);
    addressToLineMap.push({
      address,
      lineNumber: parsed.lineNumber,
      raw: parsed.raw,
    });
    address++;
  }

  //  2ª passagem: gera o código de máquina
  const hex: string[] = [];
  address = 0;

  for (const parsed of parsedLines) {
    const instruction = parsed.instruction as string;
    let word: string;

    if (instruction === "DEC") {
      const value = parseInt(parsed.operand ?? "", 10);
      if (isNaN(value)) {
        addError(
          parsed.lineNumber,
          `valor inválido em DEC ("${parsed.operand ?? ""}").`,
          parsed.operandRange?.startColumn,
          parsed.operandRange?.endColumn,
        );
        word = "????";
      } else if (value < -32768 || value > 32767) {
        addError(
          parsed.lineNumber,
          `valor fora do limite de 16 bits em DEC (${value}).`,
          parsed.operandRange?.startColumn,
          parsed.operandRange?.endColumn,
        );
        word = "????";
      } else {
        word = toHexWord(value);
      }
    } else if (instruction === "HEX") {
      const value = parseInt(parsed.operand ?? "", 16);
      if (isNaN(value)) {
        addError(
          parsed.lineNumber,
          `valor hexadecimal inválido em HEX ("${parsed.operand ?? ""}").`,
          parsed.operandRange?.startColumn,
          parsed.operandRange?.endColumn,
        );
        word = "????";
      } else if (value < 0 || value > 0xffff) {
        addError(
          parsed.lineNumber,
          `valor fora do limite de 16 bits em HEX (${parsed.operand}).`,
          parsed.operandRange?.startColumn,
          parsed.operandRange?.endColumn,
        );
        word = "????";
      } else {
        word = toHexWord(value);
      }
    } else if (OPCODES[instruction] !== undefined) {
      const opcode = OPCODES[instruction];
      let operandBits = "000";

      if (instruction === "SKIPCOND") {
        const valueStr = parsed.operand ?? "0";
        const value = parseInt(valueStr, 16);
        if (
          isNaN(value) ||
          (value !== 0x000 && value !== 0x400 && value !== 0x800)
        ) {
          addError(
            parsed.lineNumber,
            `condição inválida em SKIPCOND ("${parsed.operand}"). Use 000 (AC < 0), 400 (AC = 0) ou 800 (AC > 0).`,
            parsed.operandRange?.startColumn,
            parsed.operandRange?.endColumn,
          );
        } else {
          operandBits = value.toString(16).toUpperCase().padStart(3, "0");
        }
      } else if (!NO_OPERAND_INSTRUCTIONS.includes(instruction)) {
        if (parsed.operand === undefined) {
          addError(
            parsed.lineNumber,
            `instrução "${instruction}" requer um operando.`,
            parsed.instructionRange?.startColumn,
            parsed.instructionRange?.endColumn,
          );
        } else {
          const target = symbolTable[parsed.operand];
          if (target === undefined) {
            addError(
              parsed.lineNumber,
              `label "${parsed.operand}" não foi encontrada.`,
              parsed.operandRange?.startColumn,
              parsed.operandRange?.endColumn,
            );
          } else {
            operandBits = target.toString(16).toUpperCase().padStart(3, "0");
          }
        }
      }

      word = opcode + operandBits;
    } else {
      addError(
        parsed.lineNumber,
        `instrução desconhecida "${instruction}".`,
        parsed.instructionRange?.startColumn,
        parsed.instructionRange?.endColumn,
      );
      word = "????";
    }

    const addrLabel = address.toString(16).toUpperCase().padStart(3, "0");
    hex.push(`${addrLabel}: ${word}`);
    address++;
  }

  return {
    hex,
    errors,
    structuredErrors,
    symbolTable,
    symbols,
    addressToLineMap,
    parsedLines,
  };
}

// Converte um número (positivo ou negativo) em palavra hex de 16 bits, complemento de dois.
function toHexWord(value: number): string {
  const unsigned = value < 0 ? 0x10000 + value : value;
  return unsigned.toString(16).toUpperCase().padStart(4, "0");
}

