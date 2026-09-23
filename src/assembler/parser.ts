export interface TokenRange {
  startColumn: number;
  endColumn: number;
}

export interface ParsedLine {
  lineNumber: number;
  label?: string;
  labelRange?: TokenRange;
  instruction?: string;
  instructionRange?: TokenRange;
  operand?: string;
  operandRange?: TokenRange;
  raw: string;
}

export function parseLine(raw: string, lineNumber: number): ParsedLine {
  // Remove comentário
  const commentIndex = raw.indexOf("//");
  const codePart = commentIndex >= 0 ? raw.substring(0, commentIndex) : raw;

  if (!codePart.trim()) {
    return { lineNumber, raw };
  }

  let code = codePart;
  let offset = 0;

  // Trata leading whitespace
  const leadingSpaces = code.search(/\S/);
  if (leadingSpaces > 0) {
    offset += leadingSpaces;
    code = code.substring(leadingSpaces);
  }

  let label: string | undefined;
  let labelRange: TokenRange | undefined;

  // Se houver vírgula, tudo antes dela é o label
  const commaIndex = code.indexOf(",");
  if (commaIndex >= 0) {
    const rawLabel = code.substring(0, commaIndex);
    const trimmedLabel = rawLabel.trim();
    if (trimmedLabel) {
      const labelStart = offset + rawLabel.indexOf(trimmedLabel);
      label = trimmedLabel;
      labelRange = {
        startColumn: labelStart,
        endColumn: labelStart + trimmedLabel.length,
      };
    }
    const afterComma = code.substring(commaIndex + 1);
    const leadingAfterComma = afterComma.search(/\S/);
    if (leadingAfterComma >= 0) {
      offset += commaIndex + 1 + leadingAfterComma;
      code = afterComma.substring(leadingAfterComma);
    } else {
      code = "";
    }
  }

  if (!code) {
    return { lineNumber, label, labelRange, raw };
  }

  let instruction: string | undefined;
  let instructionRange: TokenRange | undefined;
  let operand: string | undefined;
  let operandRange: TokenRange | undefined;

  const matchInst = code.match(/^(\S+)/);
  if (matchInst) {
    instruction = matchInst[1].toUpperCase();
    const instStart = offset;
    instructionRange = {
      startColumn: instStart,
      endColumn: instStart + matchInst[1].length,
    };

    const rest = code.substring(matchInst[1].length);
    const restLeading = rest.search(/\S/);
    if (restLeading >= 0) {
      const operandCode = rest.substring(restLeading);
      const matchOp = operandCode.match(/^(\S+)/);
      if (matchOp) {
        operand = matchOp[1];
        const opStart = offset + matchInst[1].length + restLeading;
        operandRange = {
          startColumn: opStart,
          endColumn: opStart + matchOp[1].length,
        };
      }
    }
  }

  return {
    lineNumber,
    label,
    labelRange,
    instruction,
    instructionRange,
    operand,
    operandRange,
    raw,
  };
}

