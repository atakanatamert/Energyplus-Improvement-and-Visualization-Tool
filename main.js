const { app, BrowserWindow, ipcMain, shell } = require("electron");

require("electron-reload")(__dirname, {
  // Note that the path to electron may vary according to the main file
  electron: require(`${__dirname}/node_modules/electron`)
});

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
  //win.setResizable(false);
}

app.on("ready", createWindow);

// Quit when all windows are closed.
app.on("window-all-closed", () => {
  // On macOS it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== "darwin") {
    app.quit();
  }
});
const exec = require("child_process").exec;

global.RunSimulation = () => {
  if (process.platform == "win32") {
    var run = exec("run.bat", (error, stdout, stderr) => {
      console.log(stdout);
      console.log(stderr);
      if (error !== null) {
        console.log(`exec error: ${error} + ${app.getAppPath()}`);
      }
    });
  } else {
    var run = exec("run.sh", (error, stdout, stderr) => {
      console.log(stdout);
      console.log(stderr);
      if (error !== null) {
        console.log(`exec error: ${error}`);
      }
    });
  }
};
