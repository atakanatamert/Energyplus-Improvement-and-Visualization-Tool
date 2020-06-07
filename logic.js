const exec = require("child_process").exec;
const fs = require("fs");
const apex = require("apexcharts");
const findRemoveSync = require("find-remove");

var csvFiles = [];
var isOpen,
  isFinished = false;
var idf, epw, chart;
var simulationMap = {};
var simulationCount = 0;
var data = "";

class SimulationObject {
  constructor(idfFile, epwFile) {
    this.idfFile = idfFile;
    this.epwFile = epwFile;
  }

  get idf() {
    return this.idfFile;
  }

  get epw() {
    return this.epwFile;
  }
}

function startVisualization() {
  fetchCoordinates = "python main.py ";
  var result = findRemoveSync(__dirname, { prefix: "coordinates" });

  for (var i = 1; i < simulationCount + 1; i++) {
    fetchCoordinates += simulationMap["Simulation" + i].idf.name + " ";
  }

  var run = exec(fetchCoordinates, (error, stdout, stderr) => {
    console.log(stdout);
    console.log(stderr);
    if (error !== null) {
      console.log(`exec error: ${error}`);
    } else {
      console.log("Coordinates found!");
    }
  });

  for (var i = 0; i < simulationCount; i++) {
    var sub = __dirname + "\\coordinates" + i + ".txt";
    var visualizeUnity = '.\\Test.exe --inputDir "' + sub + '"';
    console.log(visualizeUnity);
    var runUnity = exec(visualizeUnity, (error, stdout, stderr) => {
      console.log(stdout);
      console.log(stderr);
      if (error !== null) {
        console.log(`exec error: ${error}`);
      } else {
        console.log("Coordinates found!");
      }
    });
  }
}

function getData(dataCSV) {
  const xs = [];
  const ys = [];

  const table = dataCSV.toString().split("\n").slice(1);
  const line = dataCSV.toString().split(/\r\n|\n/);
  const line2 = line.toString().split(",");

  var dropdown = document.getElementById("csvOptions");

  for (var i = 1; i < 75; i++) {
    var opt = document.createElement("option");
    opt.innerHTML = line2[i];
    dropdown.appendChild(opt);
  }

  var selectedVal = dropdown[dropdown.selectedIndex].value;

  var x;
  for (var i = 1; i < 75; i++) {
    if (selectedVal == line2[i]) {
      x = i;
    }
  }
  var curr = [];

  table.forEach((row) => {
    //console.log("--------------------------------------------------" + row);
    if (row.includes("07/") || row.includes("Date")) {
      curr.push(row);
    }
  });

  curr.forEach((row) => {
    const columns = row.split(",");
    const time = columns[0];
    xs.push(time);
    const temp = columns[x];
    ys.push(temp);
  });

  return { xs, ys };
}

function changeChart() {
  chart.destroy();
  createChart();
}

function createChart() {
  const csvData = [];

  csvFiles.forEach((file) => {
    csvData.push(getData(file));
  });

  var options = {
    chart: {
      height: 150,
      type: "area",
    },
    dataLabels: {
      enabled: false,
      style: {
        color: "#F2F2F2",
      },
    },
    stroke: {
      curve: "smooth",
    },
    series: [],
    legend: {
      position: "top",
      horizontalAlign: "center",
      labels: {
        colors: "#F2F2F2",
        useSeriesColors: false,
      },
    },

    yaxis: {
      labels: {
        style: {
          color: "#F2F2F2",
        },
      },
      decimalsInFloat: 2,
    },

    xaxis: {
      labels: {
        show: false,
      },
      title: {
        style: {
          color: "#F2F2F2",
        },
      },
      axisBorder: {
        show: true,
        color: "#78909C",
        height: 1,
        width: "100%",
        offsetX: 0,
        offsetY: 0,
      },
      categories: csvData[0].xs,
    },
  };

  for (var i = 0; i < simulationCount; i++) {
    options.series[i] = {
      name: "Simulation " + (i + 1),
      data: csvData[i].ys,
      style: {
        color: "#F2F2F2",
      },
    };
  }

  chart = new apex(document.getElementById("chart1"), options);

  chart.render();
  slideToDashboard();
}

function readCSVDirectories() {
  var filePath = simulationMap["Simulation1"].idf.path.replace(
    simulationMap["Simulation1"].idf.name,
    ""
  );
  var files = fs.readdirSync(filePath + "SimulationResults");

  files.forEach((file) => {
    if (process.platform == "win32") {
      var individualSims = fs.readdirSync(
        filePath + "SimulationResults\\" + file
      );
      individualSims.forEach((simFile) => {
        if (simFile == "eplusout.csv") {
          //console.log("CSV for " + file + " is " + simFile);
          //console.log(filePath + "SimulationResults\\" + file + "\\" + simFile);

          var currFile = fs.readFileSync(
            filePath + "SimulationResults\\" + file + "\\" + simFile
          );
          csvFiles.push(currFile);
        }
      });
    } else {
      var individualSims = fs.readdirSync(
        filePath + "SimulationResults/" + file
      );
      individualSims.forEach((simFile) => {
        if (simFile == "eplusout.csv") {
          //console.log("CSV for " + file + " is " + simFile);

          var x = fs.createReadStream(
            filePath + "SimulationResults/" + file + "/" + simFile
          );
          console.log("XXXXXXXXXX:" + sim);
          console.log(filePath + "SimulationResults/" + file + "/" + simFile);
        }
      });
    }
  });
  slideToDashboard();
}

function slideToDashboard() {
  document.getElementById("dashboard").style =
    "left: 0px; transition: left 2s;";
  document.getElementById("simulationAdditionPanel").style =
    "left: -900px; transition: left 2s; position: fixed;";
}

function runSelectedSimulations() {
  waitForSimulations();
  var i = 1;
  var filePath = simulationMap["Simulation" + i].idf.path.replace(
    simulationMap["Simulation" + i].idf.name,
    ""
  );
  data +=
    "cd " +
    filePath +
    "\n" +
    "mkdir SimulationResults" +
    "\n" +
    "cd SimulationResults";
  for (i = 1; i < simulationCount + 1; i++) {
    console.log(i);

    data +=
      "\n" +
      "mkdir Simulation" +
      i +
      "\n" +
      "cd Simulation" +
      i +
      "\n" +
      "energyplus -w " +
      simulationMap["Simulation" + i].epw.path +
      " -r " +
      simulationMap["Simulation" + i].idf.path +
      "\n" +
      "cd .." +
      "\n";
  }

  fs.writeFile("run.sh", data, (err) => {
    if (err) console.log(err);
    console.log("Successfully Written to File.");
  });
  fs.writeFile("run.bat", data, (err) => {
    if (err) console.log(err);
    console.log("Successfully Written to File.");
  });

  i = 1;
  //console.log(simulationMap["Simulation" + i].epw.path);

  if (process.platform == "win32") {
    var run = exec("run.bat", (error, stdout, stderr) => {
      console.log(stdout);
      console.log(stderr);
      if (error !== null) {
        console.log(`exec error: ${error} + ${app.getAppPath()}`);
      } else {
        console.log("simulation finished");
        //readCSVDirectories();
        //createChart();
        waitForSimulations();
        readCSVDirectories();
        createChart();
      }
    });
    run.on("exit", (code) => {
      console.log(`Child exited with code ${code}`);
    });
  } else {
    var run = exec("sh run.sh", (error, stdout, stderr) => {
      console.log(stdout);
      console.log(stderr);
      if (error !== null) {
        console.log(`exec error: ${error}`);
      } else {
        console.log("simulation finished");
        //readCSVDirectories();
        waitForSimulations();
        readCSVDirectories();
      }
    });
    run.on("exit", (code) => {
      console.log(`Child exited with code ${code}`);
    });
  }
}

function isRunnable() {
  if (simulationCount >= 1) {
    document.getElementById("runSim").removeAttribute("disabled");
  } else {
    document.getElementById("runSim").setAttribute("disabled", "disabled");
  }
}

function detectDrop() {
  //console.log("DetectDrop initiated");
  var holder = document.getElementById("importScreen");
  var plusIcon = document.getElementById("plus");
  var importHeader = document.getElementById("importHeader");

  holder.ondragover = () => {
    holder.style.borderColor = "#D9806C";
    plusIcon.style.color = "#D9806C";
    importHeader.style.color = "#D9806C";
    return false;
  };

  holder.ondragleave = () => {
    holder.style.borderColor = "#F2F2F2";
    plusIcon.style.color = "#F2F2F2";
    importHeader.style.color = "#F2F2F2";
    return false;
  };

  holder.ondragend = () => {
    holder.style.borderColor = "#F2F2F2";
    plusIcon.style.color = "#F2F2F2";
    importHeader.style.color = "#F2F2F2";
    return false;
  };

  holder.ondrop = (e) => {
    e.preventDefault();

    if (e.dataTransfer.files.length > 1) {
      //Multiple file dragged
      holder.style.borderColor = "#F2F2F2";
      plusIcon.style.color = "#F2F2F2";
      importHeader.style.color = "#F2F2F2";

      for (var i = 0; i < e.dataTransfer.files.length; i++) {
        if (e.dataTransfer.files[i].name.split(".").pop().includes("idf")) {
          idf = e.dataTransfer.files[i];
          console.log("idf file loaded");
        }

        if (e.dataTransfer.files[i].name.split(".").pop().includes("epw")) {
          epw = e.dataTransfer.files[i];
          console.log("epw file loaded!");
        }
      }
    } else if (e.dataTransfer.files[0].name.split(".").pop().includes("idf")) {
      console.log("correct file!");
      idf = e.dataTransfer.files[0];
    } else if (e.dataTransfer.files[0].name.split(".").pop().includes("epw")) {
      console.log("correct file!");
      epw = e.dataTransfer.files[0];
    }

    if (idf == null && epw == null) {
      importHeader.textContent = "Only drag .idf and .epw file";
      holder.style.borderColor = "#F2F2F2";
      plusIcon.style.color = "#F2F2F2";
      importHeader.style.color = "#F2F2F2";
      detectDrop();
    } else if (idf == null) {
      importHeader.textContent = "Please drag .idf file";
      holder.style.borderColor = "#F2F2F2";
      plusIcon.style.color = "#F2F2F2";
      importHeader.style.color = "#F2F2F2";
      detectDrop();
    } else if (epw == null) {
      importHeader.textContent = "Please drag .epw file";
      holder.style.borderColor = "#F2F2F2";
      plusIcon.style.color = "#F2F2F2";
      importHeader.style.color = "#F2F2F2";
      detectDrop();
    } else {
      simulationCount++;

      simulationMap["Simulation" + simulationCount] = new SimulationObject(
        idf,
        epw
      );

      createSimulationVisualElement();

      isRunnable();

      toggleBlur();
    }

    return false;
  };
}

function removeSimulation(simId) {
  console.log("Remove Simulation " + simId);
  document.getElementById("sim" + simId).remove();

  for (var i = 0; i < simulationCount - simId; i++) {
    if (document.getElementById("sim" + (simId + i + 1)) != null) {
      document
        .getElementById("sim" + (simId + i + 1))
        .getElementsByTagName("h2")[0].textContent =
        "Simulation " + (simId + i);
      document
        .getElementById("sim" + (simId + i + 1))
        .setAttribute("onclick", "removeSimulation(" + (simId + i) + ")");
      document.getElementById("sim" + (simId + i + 1)).id = "sim" + (simId + i);
    } else {
      break;
    }
  }

  simulationCount--;
  isRunnable();
}

function inputControl() {
  idf = null;
  epw = null;
  toggleBlur();
}

function closeAddSim() {
  toggleBlur();
}

function toggleBlur() {
  if (isOpen) {
    document.getElementById("importScreen").style.display = "none";
    document.getElementById("addSim").style = null;
    document.getElementById("runSim").style = null;
    document.getElementById("simulations").style = null;
    document.getElementById("bottomControls").style = null;
  } else {
    document.getElementById("importScreen").style.display = "table";
    document.getElementById("addSim").style =
      " filter: blur(8px);-webkit-filter: blur(8px);";
    document.getElementById("runSim").style =
      " filter: blur(8px);-webkit-filter: blur(8px);";
    document.getElementById("simulations").style =
      " filter: blur(8px);-webkit-filter: blur(8px);";
    document.getElementById("bottomControls").style =
      " filter: blur(8px);-webkit-filter: blur(8px);";
  }
  isOpen = !isOpen;
}

function waitForSimulations() {
  if (isFinished) {
    document.getElementById("waitScreen").style.display = "none";
    document.getElementById("addSim").style = null;
    document.getElementById("runSim").style = null;
    document.getElementById("simulations").style = null;
    document.getElementById("bottomControls").style = null;
  } else {
    document.getElementById("waitScreen").style.display = "table";
    document.getElementById("addSim").style =
      " filter: blur(8px);-webkit-filter: blur(8px);";
    document.getElementById("runSim").style =
      " filter: blur(8px);-webkit-filter: blur(8px);";
    document.getElementById("simulations").style =
      " filter: blur(8px);-webkit-filter: blur(8px);";
    document.getElementById("bottomControls").style =
      " filter: blur(8px);-webkit-filter: blur(8px);";
  }
  isFinished = !isFinished;
}

function createSimulationVisualElement() {
  var sim = document.createElement("div");
  var simInfo = document.createElement("div");
  var idfInfo = document.createElement("p");
  var epwInfo = document.createElement("p");
  var removeSim = document.createElement("p");
  var simHeader = document.createElement("h2");
  var a = document.createElement("a");

  a.className = "icon";

  var i = document.createElement("i");
  i.className = "fa fa-trash";

  a.appendChild(i);

  sim.id = "sim" + simulationCount;
  sim.className = "sim";
  simHeader.className = "simHeader";
  simHeader.textContent = "Simulation " + simulationCount;
  removeSim.innerHTML = "&#x1F5D1";
  simInfo.id = "simInfo" + simulationCount;
  simInfo.className = "simInfo";
  removeSim.id = "removeSim" + simulationCount;
  removeSim.className = "removeSim";

  idfInfo.textContent = idf.name;
  epwInfo.textContent = epw.name;
  simInfo.appendChild(a);

  sim.appendChild(simHeader);
  sim.appendChild(idfInfo);
  sim.appendChild(epwInfo);
  sim.appendChild(simInfo);
  sim.setAttribute("onclick", "removeSimulation(" + simulationCount + ")");
  document.getElementById("simulations").appendChild(sim);
}
