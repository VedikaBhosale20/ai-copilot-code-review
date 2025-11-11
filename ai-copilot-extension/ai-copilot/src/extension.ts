import * as vscode from "vscode";
import fetch from "node-fetch"; // npm install node-fetch@2

let panel: vscode.WebviewPanel | undefined;

export function activate(context: vscode.ExtensionContext) {
  console.log("AI Copilot is now active!");

  let disposable = vscode.commands.registerCommand("ai-copilot.analyzeCode", async () => {
    if (!panel) {
      panel = vscode.window.createWebviewPanel(
        "aiCopilotChat",
        "AI Copilot Chat",
        vscode.ViewColumn.Beside,
        { enableScripts: true } // needed for input box + messaging
      );

      panel.webview.html = getWebviewContent();

      // Listen for messages from webview (user questions)
      panel.webview.onDidReceiveMessage(async (msg) => {
        if (msg.command === "askAI") {
          const editor = vscode.window.activeTextEditor;
          const selectedText = editor?.document.getText(editor.selection) || "";
          const code = selectedText || editor?.document.getText() || "";

          try {
            const response = await fetch("http://127.0.0.1:5000/analyze", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ question: msg.text, code }),
            });

            if (!response.ok) {
              throw new Error(`Backend error: ${response.statusText}`);
            }

            const data = await response.json();

            // Send AI's answer back to webview
            panel?.webview.postMessage({
              command: "answer",
              text: data.answer || JSON.stringify(data, null, 2),
            });
          } catch (error: any) {
            vscode.window.showErrorMessage("Error: " + error.message);
          }
        }
      });

      panel.onDidDispose(() => (panel = undefined));
    } else {
      panel.reveal();
    }
  });

  context.subscriptions.push(disposable);
}

function getWebviewContent(): string {
  return `
    <html>
      <body style="font-family: sans-serif; padding: 10px;">
        <h2>🤖 AI Copilot Chat</h2>
        <div id="chat" style="border: 1px solid #ccc; padding: 10px; height: 400px; overflow-y: auto;"></div>
        <div style="margin-top: 10px;">
          <input id="input" style="width: 80%;" placeholder="Ask something about your code..."/>
          <button onclick="send()">Send</button>
        </div>

        <script>
          const chat = document.getElementById("chat");
          const vscode = acquireVsCodeApi();

          function appendMessage(sender, text) {
            const div = document.createElement("div");
            div.innerHTML = "<b>" + sender + ":</b> " + text;
            chat.appendChild(div);
            chat.scrollTop = chat.scrollHeight;
          }

          function send() {
            const input = document.getElementById("input");
            const text = input.value;
            if (text.trim() === "") return;
            appendMessage("You", text);
            vscode.postMessage({ command: "askAI", text });
            input.value = "";
          }

          window.addEventListener("message", (event) => {
            const msg = event.data;
            if (msg.command === "answer") {
              appendMessage("AI", msg.text);
            }
          });
        </script>
      </body>
    </html>
  `;
}

export function deactivate() {}
