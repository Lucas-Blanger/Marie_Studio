import { AssembleResult } from "../assembler/assembler";

export type SimulatorStatus =
  | "ready"
  | "running"
  | "paused"
  | "halted"
  | "error"
  | "waiting_input";

export interface SimulatorState {
  pc: string;
  pcDec: number;
  ac: number;
  acHex: string;
  ir: string;
  mar: string;
  mbr: string;
  inReg: number;
  outReg: number;
  steps: number;
  status: SimulatorStatus;
  output: string[];
  memory: string[];
  lastModified: number;
  lastAccessed: number;
  logMessage: string;
}

export class SimulatorEngine {
  private _memory: Uint16Array = new Uint16Array(4096);
  private _pc: number = 0;
  private _ac: number = 0;
  private _ir: number = 0;
  private _mar: number = 0;
  private _mbr: number = 0;
  private _inReg: number = 0;
  private _outReg: number = 0;

  private _status: SimulatorStatus = "ready";
  private _steps: number = 0;
  private _output: string[] = [];
  private _lastModifiedMemory: number = -1;
  private _lastAccessedMemory: number = -1;

  public get pc(): number {
    return this._pc;
  }

  public get status(): SimulatorStatus {
    return this._status;
  }

  public loadAssembly(assemblyResult: AssembleResult) {
    this._memory.fill(0);
    this._pc = 0;
    this._ac = 0;
    this._ir = 0;
    this._mar = 0;
    this._mbr = 0;
    this._inReg = 0;
    this._outReg = 0;
    this._steps = 0;
    this._status = "ready";
    this._output = [];
    this._lastModifiedMemory = -1;
    this._lastAccessedMemory = -1;

    if (assemblyResult.errors.length === 0) {
      for (let i = 0; i < assemblyResult.hex.length; i++) {
        const word = assemblyResult.hex[i].split(": ")[1];
        if (word && word !== "????") {
          this._memory[i] = parseInt(word, 16);
        }
      }
    }
  }

  public step(onMessage?: (msg: string) => void): boolean {
    if (this._status === "halted" || this._status === "waiting_input") {
      return false;
    }

    if (this._pc < 0 || this._pc >= 4096) {
      this._status = "error";
      if (onMessage) {
        onMessage("Erro: Contador de programa fora dos limites da memória.");
      }
      return false;
    }

    this._status = "running";
    this._mar = this._pc;
    this._mbr = this._memory[this._mar];
    this._ir = this._mbr;
    this._pc = (this._pc + 1) & 0x0fff;
    this._steps++;

    const opcode = this._ir >>> 12;
    const operand = this._ir & 0x0fff;

    this._lastAccessedMemory = operand;
    this._lastModifiedMemory = -1;

    switch (opcode) {
      case 0x0: { // JnS
        this._mar = operand;
        this._mbr = this._pc;
        this._memory[this._mar] = this._mbr;
        this._lastModifiedMemory = operand;
        this._pc = (operand + 1) & 0x0fff;
        break;
      }
      case 0x1: { // LOAD
        this._mar = operand;
        this._mbr = this._memory[this._mar];
        this._ac = this.signedWord(this._mbr);
        break;
      }
      case 0x2: { // STORE
        this._mar = operand;
        this._mbr = this.toWord(this._ac);
        this._memory[this._mar] = this._mbr;
        this._lastModifiedMemory = operand;
        break;
      }
      case 0x3: { // ADD
        this._mar = operand;
        this._mbr = this._memory[this._mar];
        this._ac = this.signedWord(this.toWord(this._ac + this.signedWord(this._mbr)));
        break;
      }
      case 0x4: { // SUBT
        this._mar = operand;
        this._mbr = this._memory[this._mar];
        this._ac = this.signedWord(this.toWord(this._ac - this.signedWord(this._mbr)));
        break;
      }
      case 0x5: { // INPUT
        this._status = "waiting_input";
        if (onMessage) {
          onMessage("Aguardando entrada de dados (INPUT)...");
        }
        return false;
      }
      case 0x6: { // OUTPUT
        this._outReg = this._ac;
        this._output.push(String(this._ac));
        break;
      }
      case 0x7: { // HALT
        this._status = "halted";
        if (onMessage) {
          onMessage("Programa finalizado (HALT).");
        }
        return false;
      }
      case 0x8: { // SKIPCOND
        let skip = false;
        if (operand === 0x000 && this._ac < 0) skip = true;
        if (operand === 0x400 && this._ac === 0) skip = true;
        if (operand === 0x800 && this._ac > 0) skip = true;
        if (skip) {
          this._pc = (this._pc + 1) & 0x0fff;
        }
        break;
      }
      case 0x9: { // JUMP
        this._pc = operand;
        break;
      }
      case 0xa: { // CLEAR
        this._ac = 0;
        break;
      }
      case 0xb: { // ADDI
        this._mar = operand;
        this._mbr = this._memory[this._mar];
        const ptr = this._mbr & 0x0fff;
        this._mar = ptr;
        this._mbr = this._memory[this._mar];
        this._ac = this.signedWord(this.toWord(this._ac + this.signedWord(this._mbr)));
        break;
      }
      case 0xc: { // JUMPI
        this._mar = operand;
        this._mbr = this._memory[this._mar];
        this._pc = this._mbr & 0x0fff;
        break;
      }
      default: {
        this._status = "error";
        if (onMessage) {
          onMessage(`Erro: Opcode inválido ${opcode.toString(16).toUpperCase()}`);
        }
        return false;
      }
    }

    this._status = "paused";
    return true;
  }

  public handleInput(value: number) {
    this._inReg = value;
    this._ac = this.signedWord(this.toWord(value));
    this._status = "paused";
  }

  public getState(logMessage?: string): SimulatorState {
    const memArray: string[] = [];
    for (let i = 0; i < 4096; i++) {
      memArray.push(this._memory[i].toString(16).toUpperCase().padStart(4, "0"));
    }

    return {
      pc: this._pc.toString(16).toUpperCase().padStart(3, "0"),
      pcDec: this._pc,
      ac: this._ac,
      acHex: this.toWord(this._ac).toString(16).toUpperCase().padStart(4, "0"),
      ir: this._ir.toString(16).toUpperCase().padStart(4, "0"),
      mar: this._mar.toString(16).toUpperCase().padStart(3, "0"),
      mbr: this._mbr.toString(16).toUpperCase().padStart(4, "0"),
      inReg: this._inReg,
      outReg: this._outReg,
      steps: this._steps,
      status: this._status,
      output: this._output,
      memory: memArray,
      lastModified: this._lastModifiedMemory,
      lastAccessed: this._lastAccessedMemory,
      logMessage: logMessage || "",
    };
  }

  private toWord(value: number): number {
    return value & 0xffff;
  }

  private signedWord(value: number): number {
    const word = this.toWord(value);
    return word & 0x8000 ? word - 0x10000 : word;
  }
}
