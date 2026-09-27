# Changelog

Todas as alterações notáveis neste projeto serão documentadas neste arquivo.

## [0.1.0] - 2026-09-27

### Adicionado

- **Diagrama Interativo do Caminho de Dados (Data Path - estilo Marie.js):**
  - Esquema gráfico em SVG vetorial interativo representando a **Unidade de Controle**, **Registradores (`IR`, `OUT`, `IN`, `AC`, `MBR`, `PC`, `MAR`)**, **ULA (ALU)** e a **Memória Principal (`Main Memory - M[MAR]`)**.
  - Barramentos coloridos de Leitura (Azul), Dados (Verde) e Escrita (Vermelho).
  - Atualização dinâmica em tempo real dos valores dentro de cada registrador e flags de condição (`AC < 0` e `AC = 0`).
  - Abas de alternância no simulador: **Caminho de Dados**, **Grade de Memória RAM** e **Visão Combinada**.
- **Entrada de Dados (INPUT) no Painel:**
  - Card fixo no painel lateral para enviar valores inteiros diretamente para o Acumulador (`AC`) via formulário ou tecla `Enter`.
  - Destaque visual brilhante automático no painel quando a CPU aguarda por dados de entrada.
- **Simulador Visual Webview (Debugger):**
  - Painel interativo com visualização em tempo real dos registradores CPU (`AC`, `PC`, `IR`, `MAR`, `MBR`, `InREG`, `OutREG`).
  - Grade interativa da Memória RAM (4096 palavras) com destaque em cores para células lidas e modificadas.
  - Controles de execução (**Executar**, **Pausar**, **Passo a Passo**, **Reiniciar**) e slider para ajuste de velocidade.
  - Sincronização e destaque visual da linha atual em execução no editor de código.
- **Diagnósticos em Tempo Real:**
  - Sublinhado de erros (squiggles) no editor para opcodes desconhecidos, rótulos (labels) não definidos ou duplicados e estouro de limite de 16 bits.
- **Language Features & IntelliSense:**
  - **Autocomplete:** Sugestões para todas as 13 instruções MARIE, diretivas `DEC`/`HEX`, condições do `SKIPCOND` e rótulos do arquivo.
  - **Hover:** Cartões de documentação em português com opcodes, operações RTL e endereços de memória ao passar o mouse.
  - **Ir para Definição:** Navegação via `F12` ou `Ctrl+Click` nos operandos até a linha de declaração da label.
- **Ícone de Arquivos `.mas`:**
  - Ícone personalizado da arquitetura MARIE para arquivos `.mas` e `.marie` no Explorer do VS Code.

---

## [0.0.3] - 2026-09-16

### Adicionado

- Syntax highlighting inicial para arquivos `.mas`.
- Montador integrado com suporte às 13 instruções do MARIE + diretivas `DEC` e `HEX`.
- Exemplos de programas em `exemplos/`.
