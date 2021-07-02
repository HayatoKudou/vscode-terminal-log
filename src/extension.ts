import * as vscode from 'vscode';

const terminalData = {};
let myStatusBarItem: vscode.StatusBarItem;

export function activate(context: vscode.ExtensionContext) {

	const options = vscode.workspace.getConfiguration('terminalLog');
	const quickPick = 'terminalLog.quickPick';

	if (!options.get('useClipboard')) {
		vscode.window.terminals.forEach(t => {
			registerTerminalForCapture(t);
		});

		vscode.window.onDidOpenTerminal(t => {
			registerTerminalForCapture(t);
		});
	}

	context.subscriptions.push(vscode.commands.registerCommand('extension.terminalLog.pasteLog', () => {

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

	context.subscriptions.push(vscode.commands.registerCommand(quickPick, () => {
		const item1: vscode.QuickPickItem = { label: "TerminalLog", description: "Paste the entire terminal" };
		const item2: vscode.QuickPickItem = { label: "TerminalComandLog", description: "Paste the command used in the terminal" };
		vscode.window.showQuickPick([item1, item2]).then((selected) => {
			if (selected.label === 'TerminalLog') {
				vscode.commands.executeCommand('extension.terminalLog.pasteLog');
			}
		});
	}));

	myStatusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right, 100);
	myStatusBarItem.command = quickPick;
	myStatusBarItem.text = 'Terminal Log';
	context.subscriptions.push(myStatusBarItem);
	myStatusBarItem.show();
}


function runCacheMode() {
	const terminal = vscode.window.activeTerminal;
	if (terminal === undefined) {
		vscode.window.showWarningMessage('The active terminal cannot be found.');
		return;
	}

	terminal.processId.then(terminalId => {
		vscode.commands.executeCommand('workbench.action.files.newUntitledFile').then(() => {
			const editor = vscode.window.activeTextEditor;
			if (editor === undefined) {
				vscode.window.showWarningMessage('The active editor cannot be found.');
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
