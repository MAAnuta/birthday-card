import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';

export function activate(context: vscode.ExtensionContext) {
    console.log('Birthday Fireworks extension is now active!');

    // Listen for when a text document is opened
    const disposable = vscode.workspace.onDidOpenTextDocument((document: vscode.TextDocument) => {
        // Only show fireworks for actual files, not untitled documents
        if (!document.uri.scheme.startsWith('untitled')) {
            showFireworks();
        }
    });

    // Also show fireworks when extension is first activated (for already open files)
    const activeEditor = vscode.window.activeTextEditor;
    if (activeEditor && !activeEditor.document.uri.scheme.startsWith('untitled')) {
        // Small delay to ensure the editor is fully loaded
        setTimeout(() => {
            showFireworks();
        }, 1000);
    }

    context.subscriptions.push(disposable);
}

function showFireworks() {
    // Create webview panel for the fireworks animation
    const panel = vscode.window.createWebviewPanel(
        'birthdayFireworks',
        '🎉 С днем рождения! 🎉',
        vscode.ViewColumn.One,
        {
            enableScripts: true,
            localResourceRoots: [vscode.Uri.file(path.join(__dirname, '..', 'resources'))]
        }
    );

    // HTML content for fireworks animation
    panel.webview.html = getFireworksHtml(panel.webview);

    // Auto-close after 8 seconds
    setTimeout(() => {
        panel.dispose();
    }, 8000);
}

function getFireworksHtml(webview: vscode.Webview): string {
    const htmlFilePath = path.join(__dirname, '..', 'resources', 'fireworks.html');
    try {
        let html = fs.readFileSync(htmlFilePath, 'utf8');
        // Convert local paths to webview URIs
        const fontUri = webview.asWebviewUri(vscode.Uri.file(path.join(__dirname, '..', 'resources', 'fonts', 'KrasnodarGroteskTrial.otf')));
        const musicUri = webview.asWebviewUri(vscode.Uri.file(path.join(__dirname, '..', 'resources', 'music', 'CHajj_Vdvojom_-_Voskresene_Den_Rozhdeniya_u_Tebya_63207405.mp3')));
        html = html.replace('./fonts/KrasnodarGroteskTrial.otf', fontUri.toString());
        html = html.replace('./music/CHajj_Vdvojom_-_Voskresene_Den_Rozhdeniya_u_Tebya_63207405.mp3', musicUri.toString());
        return html;
    } catch (error) {
        console.error('Error reading fireworks HTML file:', error);
        // Fallback to a simple message if file can't be read
        return `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>Birthday Fireworks - Error</title>
    <style>
        body { font-family: Arial, sans-serif; text-align: center; padding: 50px; background: #000; color: #fff; }
        h1 { color: #ff6b6b; }
    </style>
</head>
<body>
    <h1>🎉 С днем рождения! 🎉</h1>
    <p>Произошла ошибка при загрузке фейрверка</p>
</body>
</html>`;
    }
}

export function deactivate() {}
