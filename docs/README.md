# Documentação Técnica — MARIE Studio

Bem-vindo à documentação interna do projeto **MARIE Studio**. Esta documentação foi organizada para explicar em detalhes o funcionamento de cada módulo e camada da extensão.

---

## Módulos do Sistema

### 1. [Montador e Parser](montador.md)

Documentação do processo de interpretação de código fonte em MARIE Assembly (`.mas`), tokenização com posições de colunas, montador clássico de 2 passagens, geração de código de máquina hexadecimal de 16 bits e estruturação de erros.

### 2. [Emulador de Terminal](emulador.md)

Documentação do executor assíncrono para o painel Output do VS Code. Explica a alocação de memória virtual `Uint16Array(4096)`, registradores como variáveis e o ciclo _Fetch-Decode-Execute_.

### 3. ⚡ [Simulador Visual e Data Path](simulador.md)

Documentação do motor do simulador visual (`SimulatorEngine`), o gerenciador de janelas Webview (`MarieSimulatorPanel`) e o esquema vetorial SVG interativo do **Caminho de Dados (Data Path)** no estilo _Marie.js_.

### 4. [Recursos de Linguagem e VS Code](linguagem-vscode.md)

Documentação da integração com a API do VS Code: diagnósticos de erro em tempo real (squiggles vermelhos), autocompletar (IntelliSense), cartões informativos em português (Hover) e navegação com Ir para Definição (`F12`).
