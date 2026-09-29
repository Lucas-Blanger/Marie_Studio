# Módulo: Recursos de Linguagem e VS Code

Este módulo é responsável por integrar a linguagem MARIE Assembly ao ecossistema do VS Code, fornecendo destaques de sintaxe, autocompletar, diagnósticos de erro e dicas flutuantes (_Hover_).

---

## Arquivos do Módulo

- [`syntaxes/marie.tmLanguage.json`](../syntaxes/marie.tmLanguage.json) — Regras de Syntax Highlighting (Gramática TextMate Regex).
- [`src/providers/diagnostics.ts`](../src/providers/diagnostics.ts) — Provedor de erros em tempo real (squiggles vermelhos).
- [`src/providers/hoverProvider.ts`](../src/providers/hoverProvider.ts) — Dicas flutuantes e documentação em português.
- [`src/providers/completionProvider.ts`](../src/providers/completionProvider.ts) — Autocompletar / IntelliSense.
- [`src/providers/definitionProvider.ts`](../src/providers/definitionProvider.ts) — Navegação com Ir para Definição (`F12`).

---

## Diagnósticos em Tempo Real (`diagnostics.ts`)

Sempre que o usuário digita ou salva o arquivo `.mas`, a extensão chama a função `assemble()` e gera uma lista de objetos `vscode.Diagnostic`.

### Erros Detectados:

- **Opcode Desconhecido:** Instrução que não existe no MARIE.
- **Rótulo Ausente ou Duplicado:** Referência a uma label que não foi criada ou que foi definida mais de uma vez.
- **Estouro de Faixa:** Valores em `DEC` fora de -32768 a 32767 ou `HEX` maiores que `FFFF`.

---

## IntelliSense e Autocomplete (`completionProvider.ts`)

Sugere automaticamente:

1. Todas as 13 instruções MARIE (`LOAD`, `STORE`, `ADD`, `SUBT`, etc.).
2. Diretivas de dados (`DEC`, `HEX`).
3. Valores de condição para `SKIPCOND` (`000` para AC < 0, `400` para AC = 0, `800` para AC > 0).
4. Rótulos declarados no próprio arquivo fonte.

---

## Cartões de Hover (`hoverProvider.ts`)

Ao passar o ponteiro do mouse sobre uma instrução ou rótulo, o VS Code exibe um cartão Markdown formatado em português:

- **Instruções:** Exibe o Opcode hexadecimal, descrição em português e a operação em notação RTL (ex: $AC \leftarrow M[X]$).
- **Rótulos:** Exibe o endereço de memória associado em hex e dec (ex: `0x005` / `5`) e a linha do arquivo onde foi declarado.
