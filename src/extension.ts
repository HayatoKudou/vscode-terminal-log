import * as vscode from 'vscode';

let myStatusBarItem: vscode.StatusBarItem;

export function activate(context: vscode.ExtensionContext) {

	const options = vscode.workspace.getConfiguration('terminalLog');
	const quickPick = 'terminalLog.quickPick';
	context.subscriptions.push(vscode.commands.registerCommand('extension.terminalLog.pasteLog', () => {

		const terminals = <vscode.Terminal[]>(<any>vscode.window).terminals;
		if (terminals.length <= 0) {
			vscode.window.showWarningMessage('The active terminal cannot be found.');
			return;
		}
	}));

	context.subscriptions.push(vscode.commands.registerCommand(quickPick, () => {
		const item1: vscode.QuickPickItem = { label: "Terminal Output Log", description: "Paste the entire terminal" };
		const item2: vscode.QuickPickItem = { label: "Terminal Command Log", description: "Paste the command used in the terminal" };
		vscode.window.showQuickPick([item1, item2]).then((selected) => {
			if (selected.label === 'Terminal Output Log') {
				pasteLog();
			} else if(selected.label === 'Terminal Command Log'){
				pasteCommandLog();
			}
		});
	}));

	myStatusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left, 100);
	myStatusBarItem.command = quickPick;
	myStatusBarItem.text = 'Terminal Log';
	context.subscriptions.push(myStatusBarItem);
	myStatusBarItem.show();
}

function pasteLog() {
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

function pasteCommandLog() {
	vscode.commands.executeCommand('workbench.action.terminal.newInActiveWorkspace').then(() => {
		vscode.commands.executeCommand('workbench.action.terminal.sendSequence', {text: 'history'}).then(() => {
			vscode.commands.executeCommand('workbench.action.terminal.runSelectedText').then(() => {
				const countUp = () => {
					vscode.commands.executeCommand('workbench.action.terminal.selectAll').then(() => {
						vscode.commands.executeCommand('workbench.action.terminal.copySelection').then(() => {
							// vscode.env.clipboard.readText().then((text)=>{
							// 	console.log(text);
							// 	const history_text = text.match(/[a-c]/gi);
							// });
							// vscode.env.clipboard.writeText(text);
							vscode.commands.executeCommand('workbench.action.terminal.clearSelection').then(() => {
								vscode.commands.executeCommand('workbench.action.files.newUntitledFile').then(() => {
									vscode.commands.executeCommand('editor.action.clipboardPasteAction').then(() => {
										vscode.commands.executeCommand('workbench.action.terminal.kill');
									});
								});
							});
						});
					});
				};
				setTimeout(countUp, 1500);
			});
		});
	});
}