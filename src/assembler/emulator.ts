import { AssembleResult } from "./assembler";

export interface EmulatorResult {
  output: string[];
  steps: number;
  finalAc: number;
}

export type InputProvider = () => Promise<number>;

const MEMORY_SIZE = 0x1000;
const MAX_STEPS = 100000;

export async function runProgram(
  assembly: AssembleResult,
  inputProvider: InputProvider,
): Promise<EmulatorResult> {
  const memory = new Uint16Array(MEMORY_SIZE);
  for (let address = 0; address < assembly.hex.length; address++) {
    const word = assembly.hex[address].split(": ")[1];
    if (word === undefined || word === "????") {
      throw new Error(
        "Não foi possível carregar o código de máquina na memória.",
      );
    }
    memory[address] = parseInt(word, 16);
  }

  let pc = 0;
  let ac = 0;
  let steps = 0;
  const output: string[] = [];

  while (true) {
    if (steps >= MAX_STEPS) {
      throw new Error(
        `Execução interrompida após ${MAX_STEPS} instruções (possível loop infinito).`,
      );
    }
    if (pc < 0 || pc >= MEMORY_SIZE) {
      throw new Error(
        `Contador de programa fora da memória: ${pc.toString(16).toUpperCase()}.`,
      );
    }

    const instruction = memory[pc++];
    const opcode = instruction >>> 12;
    const operand = instruction & 0x0fff;
    steps++;

    switch (opcode) {
      case 0x0: {
        memory[operand] = pc;
        pc = (operand + 1) & 0x0fff;
        break;
      }
      case 0x1:
        ac = signedWord(memory[operand]);
        break;
      case 0x2:
        memory[operand] = toWord(ac);
        break;
      case 0x3:
        ac = signedWord(toWord(ac + signedWord(memory[operand])));
        break;
      case 0x4:
        ac = signedWord(toWord(ac - signedWord(memory[operand])));
        break;
      case 0x5:
        ac = signedWord(toWord(await inputProvider()));
        break;
      case 0x6:
        output.push(String(ac));
        break;
      case 0x7:
        return { output, steps, finalAc: ac };
      case 0x8:
        if (shouldSkip(operand, ac)) {
          pc = (pc + 1) & 0x0fff;
        }
        break;
      case 0x9:
        pc = operand;
        break;
      case 0xa:
        ac = 0;
        break;
      case 0xb:
        ac = signedWord(memory[memory[operand] & 0x0fff]);
        break;
      case 0xc:
        pc = memory[operand] & 0x0fff;
        break;
      default:
        throw new Error(
          `Opcode inválido ${opcode.toString(16).toUpperCase()} no endereço ${(pc - 1).toString(16).toUpperCase()}.`,
        );
    }
  }
}

function toWord(value: number): number {
  return value & 0xffff;
}

function signedWord(value: number): number {
  const word = toWord(value);
  return word & 0x8000 ? word - 0x10000 : word;
}

function shouldSkip(condition: number, ac: number): boolean {
  if (condition === 0x000) return ac < 0;
  if (condition === 0x400) return ac === 0;
  if (condition === 0x800) return ac > 0;
  throw new Error(
    `Condição SKIPCOND inválida: ${condition.toString(16).toUpperCase()}.`,
  );
}
