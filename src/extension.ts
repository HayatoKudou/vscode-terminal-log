import * as vscode from 'vscode';

let terminalData = {};

export function activate(context: vscode.ExtensionContext) {
	const options = vscode.workspace.getConfiguration('terminalMemo');
	terminalData = {};

	if (!options.get('enable')) {
		vscode.window.showWarningMessage('ターミナルキャプチャが無効になっています。');
		return;
	} else {
		vscode.window.showInformationMessage("ターミナルキャプチャを開始しました。",);
	}

	if (!options.get('useClipboard')) {
		vscode.window.terminals.forEach(t => {
			registerTerminalForCapture(t);
		});

		vscode.window.onDidOpenTerminal(t => {
			registerTerminalForCapture(t);
		});
	}

	context.subscriptions.push(vscode.commands.registerCommand('extension.terminalMemo.runCapture', () => {
		if (!options.get('enable')) {
			vscode.window.showWarningMessage('ターミナルキャプチャが無効になっています。');
		}

		const terminals = <vscode.Terminal[]>(<any>vscode.window).terminals;
		if (terminals.length <= 0) {
			vscode.window.showWarningMessage('端末が見つかりません。');
			return;
		}

		if (options.get('useClipboard')) {
			runClipboardMode();
		} else {
			runCacheMode();
		}
	}));
}

export function deactivate() {
	terminalData = {};
}


function runCacheMode() {
	const terminal = vscode.window.activeTerminal;
	if (terminal === undefined) {
		vscode.window.showWarningMessage('アクティブな端末が見つかりません。');
		return;
	}

	terminal.processId.then(terminalId => {
		vscode.commands.executeCommand('workbench.action.files.newUntitledFile').then(() => {
			const editor = vscode.window.activeTextEditor;
			if (editor === undefined) {
				vscode.window.showWarningMessage('アクティブなエディターが見つかりません。');
				return;
			}

			const cache = cleanupCacheData((<any>terminalData)[terminalId]);
			editor.edit(builder => {
				builder.insert(new vscode.Position(0, 0), cache);
			});
		});
	});
}


function runClipboardMode() {
	vscode.commands.executeCommand('workbench.action.terminal.selectAll').then(() => {
		vscode.commands.executeCommand('workbench.action.terminal.copySelection').then(() => {
			vscode.commands.executeCommand('workbench.action.terminal.clearSelection').then(() => {
				vscode.commands.executeCommand('workbench.action.files.newUntitledFile').then(() => {
					vscode.commands.executeCommand('editor.action.clipboardPasteAction');
				});
			});
		});
	});
}


function cleanupCacheData(data: string): string {
	return data.replace(new RegExp('\x1b\[[0-9;]*m', 'g'), '');
}

function registerTerminalForCapture(terminal: vscode.Terminal) {
	terminal.processId.then(terminalId => {
		(<any>terminalData)[terminalId] = "";
		(<any>terminal).onDidWriteData((data: any) => {
			(<any>terminalData)[terminalId] += data;
		});
	});
}
