'use strict';

import * as vscode from 'vscode';

import { DepNodeProvider } from './nodeDependencies';

export function activate(context: vscode.ExtensionContext) {

	// Samples of `window.registerTreeDataProvider`
	const nodeDependenciesProvider = new DepNodeProvider(vscode.workspace.rootPath);
	vscode.window.registerTreeDataProvider('nodeDependencies', nodeDependenciesProvider);

	vscode.window.createTreeView('nodeDependencies', {
		treeDataProvider: nodeDependenciesProvider
	});
}