# MARIE Assembly — Extensão para VS Code

Extensão para o VS Code voltada à linguagem Assembly da arquitetura **MARIE** (_Machine Architecture that is Really Intuitive and Easy_), a máquina didática usada no ensino de Organização e Arquitetura de Computadores.

---

## Funcionalidades

- **Realce de Sintaxe (Syntax Highlighting):** colore instruções (`LOAD`, `STORE`, `ADD`...), diretivas (`DEC`, `HEX`), registradores (`AC`, `MAR`, `MBR`...) e comentários (`//`) em arquivos `.mas` e `.marie`.
- **Diagnósticos em Tempo Real (Real-time Diagnostics):** sublinhado de erros (squiggles vermelhos) no editor para instruções inválidas, rótulos duplicados ou ausentes e estouro de 16 bits.
- **IntelliSense & Documentação em Português:**
  - **Autocomplete:** sugestão automática de instruções, diretivas de dados e rótulos declarados no arquivo.
  - **Hover (Dicas ao passar o mouse):** explicações técnicas em português com opcodes e operações em RTL ($AC \leftarrow M[X]$).
  - **Ir para Definição (`F12` / `Ctrl+Click`):** navegação instantânea do operando para a linha onde o rótulo foi definido.
- **Simulador Visual Interativo (Debugger Webview):**
  - **Diagrama do Caminho de Dados (Data Path - estilo Marie.js):** esquema vetorial interativo em SVG com os registradores (`IR`, `OUT`, `IN`, `AC`, `MBR`, `PC`, `MAR`), **Unidade de Controle**, **ULA (ALU)** e **Memória Principal (`M[MAR]`)** com barramentos coloridos lidos/escritos em tempo real.
  - **Grade da Memória RAM:** visualização completa das 4096 palavras de memória com destaque de leitura (azul) e escrita (verde).
  - **Controles de Execução:** botões de **Executar**, **Pausar**, **Passo a Passo (Step)**, **Reiniciar** e slider de ajuste de velocidade.
  - **Entrada de Dados (INPUT):** formulário direto no painel com foco automático e envio por tecla `Enter`.
  - **Destaque no Editor:** sincronização da instrução em execução com destaque na linha correspondente do arquivo de código fonte.
- **Ícone Personalizado:** ícone oficial para arquivos `.mas` e `.marie` no Explorer do VS Code.

---

## Como Rodar em Modo de Desenvolvimento

1. Clone o repositório e instale as dependências:
   ```bash
   npm install
   ```
2. Compile o TypeScript:
   ```bash
   npm run compile
   ```
   _(ou use `npm run watch` para recompilar automaticamente a cada alteração)_
3. Abra a pasta no VS Code e pressione **F5** (ou execute no terminal: `code --extensionDevelopmentPath=.`).
4. Na nova janela do VS Code, abra um dos arquivos de teste em `exemplos/` (ex.: `soma.mas`).
5. Clique no ícone de **Dashboard** no topo do editor para abrir o **Simulador Visual MARIE**!

---

## Estrutura do Projeto

```
Marie_Studio/
├── package.json                    # Manifesto da extensão e contribuições
├── language-configuration.json     # Regras de comentários e fechamento de parênteses
├── syntaxes/marie.tmLanguage.json  # Gramática de realce de cores (TextMate Regex)
├── images/                         # Logotipo e ícone oficial dos arquivos .mas
├── src/
│   ├── extension.ts                # Ponto de entrada e registro de comandos/providers
│   ├── assembler/
│   │   ├── instructions.ts         # Tabela de opcodes e diretivas MARIE
│   │   ├── parser.ts               # Parser com suporte a posições de coluna
│   │   ├── assembler.ts            # Montador de 2 passagens e diagnósticos
│   │   └── emulator.ts             # Emulador de execução no terminal
│   ├── providers/
│   │   ├── diagnostics.ts          # Sublinhado de erros em tempo real
│   │   ├── hoverProvider.ts        # Documentação Hover em Português
│   │   ├── completionProvider.ts   # Autocompletar / IntelliSense
│   │   └── definitionProvider.ts   # Ir para Definição (F12)
│   └── simulator/
│       ├── simulatorEngine.ts      # Motor de execução e estado da CPU MARIE
│       ├── simulatorHtml.ts        # Template HTML/CSS/SVG do Data Path e Simulador
│       └── simulatorPanel.ts       # Gerenciador da janela Webview e decorações no editor
└── exemplos/                       # Programas de teste em MARIE Assembly (.mas)
```

---

## Instruções Suportadas no MARIE

| Instrução    | Opcode | Operação RTL                              | Descrição                                                               |
| ------------ | ------ | ----------------------------------------- | ----------------------------------------------------------------------- |
| **JnS**      | `0`    | $M[X] \leftarrow PC, PC \leftarrow X + 1$ | Desvio e armazenamento do endereço da instrução (Subrotina)             |
| **LOAD**     | `1`    | $AC \leftarrow M[X]$                      | Carrega conteúdo da memória X no AC                                     |
| **STORE**    | `2`    | $M[X] \leftarrow AC$                      | Armazena conteúdo do AC no endereço X                                   |
| **ADD**      | `3`    | $AC \leftarrow AC + M[X]$                 | Soma conteúdo da memória X ao AC                                        |
| **SUBT**     | `4`    | $AC \leftarrow AC - M[X]$                 | Subtrai conteúdo da memória X do AC                                     |
| **INPUT**    | `5`    | $AC \leftarrow InREG$                     | Lê valor da entrada para o AC                                           |
| **OUTPUT**   | `6`    | $OutREG \leftarrow AC$                    | Exibe valor do AC na saída                                              |
| **HALT**     | `7`    | Parar execução                            | Interrompe a execução do programa                                       |
| **SKIPCOND** | `8`    | Condição no AC                            | Pula próxima instrução se (`000`: AC < 0, `400`: AC = 0, `800`: AC > 0) |
| **JUMP**     | `9`    | $PC \leftarrow X$                         | Desvio incondicional para o endereço X                                  |
| **CLEAR**    | `A`    | $AC \leftarrow 0$                         | Zera o Acumulador                                                       |
| **ADDI**     | `B`    | $AC \leftarrow AC + M[M[X]]$              | Soma indireta apontada por X ao AC                                      |
| **JUMPI**    | `C`    | $PC \leftarrow M[X]$                      | Desvio indireto para o endereço armazenado em X                         |
| **DEC**      | `—`    | Dado Decimal                              | Reserva palavra de memória com valor decimal (16 bits)                  |
| **HEX**      | `—`    | Dado Hexadecimal                          | Reserva palavra de memória com valor hexadecimal (16 bits)              |

---
