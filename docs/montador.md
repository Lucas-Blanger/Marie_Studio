# Módulo: Montador e Parser

O módulo do Montador é responsável por ler o código fonte em Assembly do MARIE (`.mas`), analisar sua sintaxe, construir a tabela de símbolos e gerar o código de máquina correspondente em hexadecimal de 16 bits.

---

## Arquivos do Módulo

- [`src/assembler/instructions.ts`](../src/assembler/instructions.ts) — Tabela de opcodes e classificação de instruções.
- [`src/assembler/parser.ts`](../src/assembler/parser.ts) — Função de análise de linha e extração de tokens com posições de colunas.
- [`src/assembler/assembler.ts`](../src/assembler/assembler.ts) — Algoritmo de montagem em 2 passagens e estruturação de erros.

---

## Como Funciona o Parser (`parser.ts`)

O parser lê cada linha de código fonte e separa quatro componentes principais:

1. **Rótulo (Label):** Identificador opcional que precede uma vírgula (ex: `Loop, LOAD Count`).
2. **Instrução / Diretiva:** O comando principal em maiúsculas (ex: `LOAD`, `STORE`, `DEC`, `HEX`).
3. **Operando:** O argumento da instrução (uma label, um endereço ou um valor constante).
4. **Comentário:** Qualquer texto após `//`.

### Rastreamento de Colunas (`TokenRange`)

Para permitir que o editor sublinhe exatamente a palavra com erro (em vez da linha inteira), o `parseLine()` calcula o índice de coluna de início e fim (`startColumn` e `endColumn`) para o rótulo, instrução e operando.

---

## Montador de 2 Passagens (`assembler.ts`)

A montagem ocorre em duas passagens sequenciais pela lista de linhas:

```
                  ┌───────────────────────────────┐
                  │      Código Fonte (.mas)      │
                  └───────────────┬───────────────┘
                                  │
                                  ▼
                  ┌───────────────────────────────┐
                  │    1ª Passagem: Tabela de     │
                  │   Símbolos (Labels -> End.)   │
                  └───────────────┬───────────────┘
                                  │
                                  ▼
                  ┌───────────────────────────────┐
                  │    2ª Passagem: Geração do    │
                  │    Código Hexadecimal 16-bit  │
                  └───────────────┬───────────────┘
                                  │
                                  ▼
                  ┌───────────────────────────────┐
                  │ AssembleResult (Hex + Erros)  │
                  └───────────────────────────────┘
```

### 1ª Passagem: Construção da Tabela de Símbolos

- Percorre todas as linhas atribuindo um endereço de memória sequencial ($000, 001, 002, \dots$).
- Sempre que encontra uma label (ex: `Result, DEC 0`), armazena o par `(nome, endereço)` no mapa `symbolTable`.
- Se um rótulo for declarado mais de uma vez, um erro estruturado é registrado.

### 2ª Passagem: Tradução para Código de Máquina

- Converte a combinação de `Instrução + Operando` em uma palavra hexadecimal de 16 bits (4 dígitos Hex):
  - **Bits 15..12 (1 dígito hex):** Opcode da instrução (ex: `LOAD` = `1`, `STORE` = `2`, `JUMP` = `9`).
  - **Bits 11..0 (3 dígitos hex):** Endereço do operando resolvido a partir da `symbolTable`.
- Para diretivas de dados:
  - `DEC N`: Converte o número decimal em complemento de dois de 16 bits (faixa -32768 a 32767).
  - `HEX N`: Converte o valor em hexadecimal de 16 bits.
