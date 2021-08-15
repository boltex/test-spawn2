// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import * as child from 'child_process';
import * as os from 'os';

let serverStarted: boolean = false;
let w_interval: NodeJS.Timeout;

export function activate(context: vscode.ExtensionContext) {

	console.log('Extension "test-spawn2" is now active! Node version: ' + process.version);
	console.log('process argv' + process.argv);
	console.log('process cwd' + process.cwd);

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
export function deactivate(): Promise<boolean> {
	return new Promise((resolve, reject) => {
		setTimeout(() => {
			resolve(true);
		}, 35000); // 35 seconds

	});
}

function startServer(context: vscode.ExtensionContext): void {
	w_interval = setInterval(() => { console.log("hi from js each 5s"); }, 933000);

	var w_options: child.SpawnOptions = {
		// Child to run independently of its parent process. Depends on the platform.
		detached: true,
		windowsHide: true,
		// Runs command in a shell. '/bin/sh' on Unix, process.env.ComSpec on Windows.
		shell: true
	};

	// * possible settings
	// w_options.stdio = ['inherit', 'inherit', 'inherit'];
	// w_options.stdio = ['inherit', 'pipe', 'pipe'];
	// w_options.stdio = ['pipe', process.stdout, process.stderr];

	// linux
	var launchString = "python3";
	console.log('os.platform()', os.platform());

	if (os.platform() === "win32") {
		launchString = "py";

		// w_options.stdio = 'inherit';
		// w_options.stdio = 'ignore';
		// * possible settings
		// w_options.stdio = ['inherit', 'inherit', 'inherit'];
		// w_options.stdio = [0, 1, "pipe"];
		// w_options.stdio = ['inherit', 'pipe', 'pipe'];
		// w_options.stdio = ['pipe', process.stdout, process.stderr];

	}

	var _serverProcess = child.spawn(launchString, [context.extensionPath + "/server.py"], w_options); // SPAWN method

	// To prevent the parent from waiting for a given subprocess to exit
	_serverProcess.unref();

	// Capture the OUTPUT and send it to the "leo server" OutputChannel
	if (_serverProcess && _serverProcess.stdout) {
		console.log('SETTING *ON STDOUT* connected: ', _serverProcess.connected);


		if (os.platform() === "win32") {
			// _serverProcess.stdout.pipe(process.stdout);
		}

		_serverProcess.stdout.on("data", (p_data) => {
			p_data.toString().split("\n").forEach((p_line: string) => {
				p_line = p_line.trim();
				console.log("js got data line :" + p_line);
			});
		});
	} else {
		console.error("ERROR: NO STDOUT");
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