// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import * as child from 'child_process';


let serverStarted: boolean = false;
let w_interval: NodeJS.Timeout;

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {

	// Use the console to output diagnostic information (console.log) and errors (console.error)
	// This line of code will only be executed once when your extension is activated
	console.log('Extension "test-spawn2" is now active! Node version: ' + process.version);

	// The command has been defined in the package.json file
	// Now provide the implementation of the command with registerCommand
	// The commandId parameter must match the command field in package.json
	let disposable = vscode.commands.registerCommand('test-spawn2.helloWorld', () => {
		// The code you place here will be executed every time your command is executed
		// Display a message box to the user
		vscode.window.showInformationMessage('Trying to start server on port 8080');

		if (!serverStarted) {
			console.log('starting server');
			startServer(context);
			serverStarted = true;
		} else {
			console.log('Already started!');
		}
	});

	context.subscriptions.push(disposable);
}

// this method is called when your extension is deactivated
export function deactivate() { }

function startServer(context: vscode.ExtensionContext): void {
	w_interval = setInterval(() => { console.log("hi from js each 5s"); }, 5000);

	var w_options = {
		// Child to run independently of its parent process. Depends on the platform.
		// detached: true,

		// Runs command in a shell. '/bin/sh' on Unix, process.env.ComSpec on Windows.
		// shell: true
	};

	// w_options.stdio = ['inherit', 'inherit', 'inherit'];
	// w_options.stdio = ['inherit', 'pipe', 'pipe'];
	// w_options.stdio ['pipe', process.stdout, process.stderr];

	var _serverProcess = child.spawn("python3", [context.extensionPath + "/server.py"], w_options); // SPAWN method

	// To prevent the parent from waiting for a given subprocess to exit
	// _serverProcess.unref();

	// Capture the OUTPUT and send it to the "leo server" OutputChannel
	if (_serverProcess && _serverProcess.stdout) {
		_serverProcess.stdout.on("data", (p_data) => {
			p_data.toString().split("\n").forEach((p_line: string) => {
				p_line = p_line.trim();
				console.log("js got data line :" + p_line);
			});
		});
	} else {
		console.error("No stdout");
	}
	// Capture the ERROR channel and set flags on server errors
	if (_serverProcess && _serverProcess.stderr) {
		_serverProcess.stderr.on("data", (p_data) => {
			console.log(`stderr: ${p_data}`);
		});
	} else {
		console.error("No stderr");
	}
	// Capture the CLOSE event and set flags on server actually closing
	if (_serverProcess) {
		_serverProcess.on("close", (p_code) => {
			console.log(`*** SERVER EXITED with code ${p_code}`);
			serverStarted = false;
			clearInterval(w_interval);
		});
	}

}