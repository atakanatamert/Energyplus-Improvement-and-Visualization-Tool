const { app, BrowserWindow, ipcMain, shell, remote } = require("electron");

const exec = require("child_process").exec;

var windowArr = [];
function createWindow() {
  let win = new BrowserWindow({
    width: 900,
    height: 600,
    resizable: false,
    webPreferences: {
      nodeIntegration: true
    }
  });
  win.loadFile("test.html");
  windowArr.push(win);
  win.onbeforeunload = e => {
    console.log("I do not want to be closed");

    // Unlike usual browsers that a message box will be prompted to users, returning
    // a non-void value will silently cancel the close.
    // It is recommended to use the dialog API to let the user confirm closing the
    // application.
    e.returnValue = false; // equivalent to `return false` but not recommended
  };

  //win.setResizable(false);
}
app.requestSingleInstanceLock()

app.on("ready", createWindow);
// Quit when all windows are closed.
app.on("window-all-closed", () => {
  // On macOS it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== "darwin") {
    app.quit();
  }
});

