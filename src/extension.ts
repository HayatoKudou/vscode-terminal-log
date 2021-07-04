import * as vscode from 'vscode';

let myStatusBarItem: vscode.StatusBarItem;

export function activate(context: vscode.ExtensionContext) {

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
			} else if (selected.label === 'Terminal Command Log') {
				const item1: vscode.QuickPickItem = { label: "100 Commands", description: "Paste the 100 commands used in the terminal" };
				const item2: vscode.QuickPickItem = { label: "All Commands", description: "Paste all the command used in the terminal" };
				const item3: vscode.QuickPickItem = { label: "Delete History Commands", description: "Delete command history" };
				vscode.window.showQuickPick([item1, item2, item3]).then((selected) => {
					if (selected.label === '100 Commands' || selected.label === 'All Commands') {
						getHistory(selected.label);

					} else if (selected.label === 'Delete History Commands') {
						deleteHistory();
					}
				});
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

function getHistory(selected_label: string) {
	let command = '';
	if (selected_label === '100 Commands') {
		command = 'history 100';
	} else {
		command = 'history';
	}
	vscode.commands.executeCommand('workbench.action.terminal.newInActiveWorkspace').then(() => {
		vscode.commands.executeCommand('workbench.action.terminal.clear').then(() => {
			vscode.commands.executeCommand('workbench.action.terminal.sendSequence', { text: command }).then(() => {
				vscode.commands.executeCommand('workbench.action.terminal.runSelectedText').then(() => {
					const countUp = () => {
						vscode.commands.executeCommand('workbench.action.terminal.selectToPreviousCommand').then(() => {
							vscode.commands.executeCommand('workbench.action.terminal.copySelection').then(() => {
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
					if (selected_label === '100 Commands') {
						setTimeout(countUp, 500);
					} else if (selected_label === 'All Commands') {
						setTimeout(countUp, 1000);
					}
				});
			});
		});
	});
}


function deleteHistory() {
	vscode.commands.executeCommand('workbench.action.terminal.newInActiveWorkspace').then(() => {
		vscode.commands.executeCommand('workbench.action.terminal.sendSequence', { text: 'history  -c' }).then(() => {
			vscode.commands.executeCommand('workbench.action.terminal.runSelectedText').then(() => {
				vscode.commands.executeCommand('workbench.action.terminal.kill');
			});
		});
	});
}

