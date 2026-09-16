import * as vscode from "vscode";
import { assemble } from "./assembler/assembler";
import { runProgram } from "./assembler/emulator";

export function activate(context: vscode.ExtensionContext) {
  const outputChannel = vscode.window.createOutputChannel("MARIE Assembler");

  const disposable = vscode.commands.registerCommand("marie.assemble", () => {
    const editor = vscode.window.activeTextEditor;

    if (!editor) {
      vscode.window.showErrorMessage("Abra um arquivo .mas antes de montar.");
      return;
    }

    const source = editor.document.getText();
    const result = assemble(source);

    outputChannel.clear();
    outputChannel.show(true);
    outputChannel.appendLine(`=== Montagem: ${editor.document.fileName} ===`);
    outputChannel.appendLine("");

    if (result.errors.length > 0) {
      outputChannel.appendLine("ERROS ENCONTRADOS:");
      result.errors.forEach((e) => outputChannel.appendLine("  ✗ " + e));
      outputChannel.appendLine("");
    }

    outputChannel.appendLine("CÓDIGO DE MÁQUINA (endereço: instrução hex):");
    result.hex.forEach((line) => outputChannel.appendLine("  " + line));

    if (result.errors.length === 0) {
      vscode.window.showInformationMessage("Montagem concluída com sucesso!");
    } else {
      vscode.window.showWarningMessage(
        `Montagem concluída com ${result.errors.length} erro(s). Veja o painel "MARIE Assembler".`,
      );
    }
  });

  context.subscriptions.push(disposable);

  const runDisposable = vscode.commands.registerCommand(
    "marie.run",
    async () => {
      const editor = vscode.window.activeTextEditor;

      if (!editor) {
        vscode.window.showErrorMessage(
          "Abra um arquivo .mas antes de executar.",
        );
        return;
      }

      const result = assemble(editor.document.getText());
      outputChannel.clear();
      outputChannel.show(true);
      outputChannel.appendLine(`=== Execução: ${editor.document.fileName} ===`);
      outputChannel.appendLine("");

      if (result.errors.length > 0) {
        outputChannel.appendLine("Não foi possível executar:");
        result.errors.forEach((error) =>
          outputChannel.appendLine("  ✗ " + error),
        );
        vscode.window.showErrorMessage(
          "Corrija os erros de montagem antes de executar.",
        );
        return;
      }

      try {
        const execution = await runProgram(result, async () => {
          const value = await vscode.window.showInputBox({
            prompt: "Digite um valor inteiro para INPUT",
            validateInput: (input) =>
              /^[-+]?\d+$/.test(input.trim())
                ? undefined
                : "Digite um número inteiro.",
          });
          if (value === undefined) {
            throw new Error("Execução cancelada pelo usuário.");
          }
          return Number(value);
        });

        outputChannel.appendLine("SAÍDA:");
        execution.output.forEach((value) =>
          outputChannel.appendLine("  " + value),
        );
        outputChannel.appendLine("");
        outputChannel.appendLine(
          `Execução concluída em ${execution.steps} instruções.`,
        );
        vscode.window.showInformationMessage("Execução concluída com sucesso!");
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        outputChannel.appendLine("ERRO DE EXECUÇÃO:");
        outputChannel.appendLine("  ✗ " + message);
        vscode.window.showErrorMessage(`Erro de execução: ${message}`);
      }
    },
  );

  context.subscriptions.push(runDisposable);
}

export function deactivate() {}
