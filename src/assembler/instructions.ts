/**
 * Tabela de opcodes do MARIE.
 * Cada instrução ocupa 4 bits (1 dígito hex) + 12 bits de operando (3 dígitos hex) = 16 bits.
 */
export const OPCODES: Record<string, string> = {
  JNS: "0",
  LOAD: "1",
  STORE: "2",
  ADD: "3",
  SUBT: "4",
  INPUT: "5",
  OUTPUT: "6",
  HALT: "7",
  SKIPCOND: "8",
  JUMP: "9",
  CLEAR: "A",
  ADDI: "B",
  JUMPI: "C",
};

//Instruções que NÃO recebem operando (o campo de endereço fica com zeros).

export const NO_OPERAND_INSTRUCTIONS: string[] = [
  "INPUT",
  "OUTPUT",
  "HALT",
  "CLEAR",
];

// Diretivas de dados (não são instruções, mas reservam uma palavra de memória).

export const DIRECTIVES: string[] = ["DEC", "HEX"];
