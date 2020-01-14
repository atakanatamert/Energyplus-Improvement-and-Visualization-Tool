const { app, BrowserWindow} = require("electron");

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

