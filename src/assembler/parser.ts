/**
 * Representa uma linha de código já interpretada.
 * Formato esperado: [Label,] INSTRUCAO [Operando]   // comentário
 */
export interface ParsedLine {
  lineNumber: number;
  label?: string;
  instruction?: string;
  operand?: string;
  raw: string;
}

export function parseLine(raw: string, lineNumber: number): ParsedLine {
  // Remove comentário
  const commentIndex = raw.indexOf('//');
  let code = commentIndex >= 0 ? raw.substring(0, commentIndex) : raw;
  code = code.trim();

  if (!code) {
    return { lineNumber, raw };
  }

  let label: string | undefined;

  // Se houver vírgula, tudo antes dela é o label
  const commaIndex = code.indexOf(',');
  if (commaIndex >= 0) {
    label = code.substring(0, commaIndex).trim();
    code = code.substring(commaIndex + 1).trim();
  }

  if (!code) {
    // Linha só com label, sem instrução (raro, mas tratamos)
    return { lineNumber, label, raw };
  }

  const parts = code.split(/\s+/);
  const instruction = parts[0]?.toUpperCase();
  const operand = parts[1];

  return { lineNumber, label, instruction, operand, raw };
}
