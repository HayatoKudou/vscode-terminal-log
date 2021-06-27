'use strict';

import * as vscode from 'vscode';

import { DepNodeProvider } from './nodeDependencies';
import { FtpExplorer } from './ftpExplorer';

export function activate(context: vscode.ExtensionContext) {

	// Samples of `window.registerTreeDataProvider`
	const nodeDependenciesProvider = new DepNodeProvider(vscode.workspace.rootPath);
	vscode.window.registerTreeDataProvider('nodeDependencies', nodeDependenciesProvider);

	new FtpExplorer(context);
}