import * as assert from 'assert';

// You can import and use all API from the 'vscode' module
// as well as import your extension to test it
import * as vscode from 'vscode';
import { activate } from '../../src/extension';

suite('Extension Test Suite', () => {
	vscode.window.showInformationMessage('Start all tests.');

	test('Sample test', () => {
		assert.strictEqual(-1, [1, 2, 3].indexOf(5));
		assert.strictEqual(-1, [1, 2, 3].indexOf(0));
	});

	test('Luna commands registered', async () => {
		const context = { subscriptions: [], secrets: { get: () => undefined, store: () => {} } } as any;
		await activate(context);
		const commands = await vscode.commands.getCommands(true);
		console.log('Available commands:', commands.filter(c => c.startsWith('luna') || c.startsWith('xai-multiagent')));
		assert(commands.includes('luna.startMacroFlow'), 'luna.startMacroFlow command should be registered');
		assert(commands.includes('luna.voiceQuery'), 'luna.voiceQuery command should be registered');
		assert(commands.includes('luna.syncGrokCom'), 'luna.syncGrokCom command should be registered');
		assert(commands.includes('luna.askTeam'), 'luna.askTeam command should be registered');
	});

	test('Configuration defaults', () => {
		const config = vscode.workspace.getConfiguration('lunaSherpa');
		assert.strictEqual(config.get('model'), 'grok-4-1-fast-reasoning');
		assert.strictEqual(config.get('userAddress'), 'sahib');
	});
});