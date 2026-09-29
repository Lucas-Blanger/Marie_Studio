# Módulo: Emulador de Terminal

O módulo do Emulador permite a execução de programas MARIE com saída de texto no painel **Output** do VS Code, ideal para testes rápidos sem interface gráfica.

---

## Arquivo do Módulo

- [`src/assembler/emulator.ts`](../src/assembler/emulator.ts) — Função `runProgram()` e controle da máquina de estados em terminal.

---

## Arquitetura de Execução

Ao contrário de programas nativos compilados para C ou C++, o emulador do MARIE é um **interpretador de máquinas virtuais**. Ele aloca a memória e os registradores da CPU em variáveis de memória JavaScript:

### 1. Memória RAM Virtual

```typescript
const MEMORY_SIZE = 0x1000; // 4096 Palavras de 16 bits
const memory = new Uint16Array(MEMORY_SIZE);
```

O resultado hexadecimal gerado pelo montador é carregado nas primeiras posições do array de memória a partir do endereço `000`.

### 2. O Ciclo Fetch-Decode-Execute

A função `runProgram()` roda um loop `while(true)` até encontrar a instrução `HALT` ou um erro:

```typescript
while (true) {
  // 1. Fetch: lê instrução na posição apontada por PC
  const instruction = memory[pc++];

  // 2. Decode: separa Opcode (4 bits) e Operando (12 bits)
  const opcode = instruction >>> 12;
  const operand = instruction & 0x0fff;

  // 3. Execute: executa o bloco correspondente
  switch (opcode) {
    case 0x1:
      ac = signedWord(memory[operand]);
      break; // LOAD
    case 0x2:
      memory[operand] = toWord(ac);
      break; // STORE
    case 0x3:
      ac = signedWord(toWord(ac + signedWord(memory[operand])));
      break; // ADD
    case 0x5:
      ac = signedWord(toWord(await inputProvider()));
      break; // INPUT
    case 0x6:
      output.push(String(ac));
      break; // OUTPUT
    case 0x7:
      return { output, steps, finalAc: ac }; // HALT
    // ... demais opcodes
  }
}
```

### 3. Proteções Contra Erros de Execução

- **Loop Infinito:** Limite máximo configurável de instruções executadas (`100.000` passos).
- **Estouro de Memória:** Erro disparado se o `PC` tentar acessar endereços maiores que `0x0FFF`.
