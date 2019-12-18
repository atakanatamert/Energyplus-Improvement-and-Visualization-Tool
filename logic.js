const exec = require("child_process").exec;
const papa = require("papaparse");
const fs = require("fs");
var sheet = window.document.styleSheets[0];
const apex = require('apexcharts');

var isOpen = false;
var isFinished = false;
var idf;
var epw;

var parsedSimulations = [];
var simulationMap = {};
var simulationCount = 0;
var data = "";

fs.readFile("run.sh", function (err, buf) {
  console.log(buf.toString());
});

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

function createChart() {
  const data = getData();
  console.log("X values : \n\n\n\n\n" + data.xs + "Y values : \n\n\n\n\n" + data.ys)
  var options = {
    chart: {
      height: 150,
      type: 'area',
    },
    dataLabels: {
      enabled: false,
      style: {
        colors: ["#F2F2F2"],
      }
    },
    stroke: {
      curve: 'smooth'
    },
    series: [{
      name: 'series1',
      data: data.ys, //[31, 40, 28, 51, 42, 109, 100]
    }, {
      name: 'series2',
      data: [11, 32, 45, 32, 34, 52, 41]
    }],

    xaxis: {
      //type: 'datetime',
      labels: {
        style: {
          colors: ["#F2F2F2"],
        }
      },
      title: {
        style: {
          color: "#F2F2F2",
        },
      },
      axisBorder: {
        show: true,
        color: '#78909C',
        height: 1,
        width: '100%',
        offsetX: 0,
        offsetY: 0
      },

      categories: data.xs,

      // categories: [
      //   "2018-09-19T00:00:00", "2018-09-19T01:30:00", "2018-09-19T02:30:00", "2018-09-19T03:30:00", "2018-09-19T04:30:00", "2018-09-19T05:30:00", "2018-09-19T06:30:00"
      // ],
    },
    // tooltip: {
    //   x: {
    //     format: 'dd/MM/yy HH:mm'
    //   },
    // }
  }

  function getData() {
    const xs = [];
    const ys = [];
    const data = fs.readFileSync('./eplusout.csv')

    const table = data.toString().split('\n').slice(1);
    table.forEach(row => {
      const columns = row.split(',');
      const time = columns[0];
      xs.push(time);
      const temp = columns[1];
      ys.push(temp);
    })
    return { xs, ys };
  }

  var chart = new apex(
    document.getElementById("chart1"),
    options
  );

  chart.render();
  // var options2 = {
  //   chart: {
  //     height: 500,
  //     type: 'bar',
  //     stacked:'true',

  //   },
  //   dataLabels: {
  //     enabled: true,
  //     style: {
  //       colors: ["#F2F2F2"],
  //     }
  //   },
  //   stroke: {
  //     curve: 'smooth'
  //   },
  //   series: [{
  //     name: 'series1',
  //     data: [31, 40, 28, 51, 42, 109, 100]
  //   }, {
  //     name: 'series2',
  //     data: [11, 32, 45, 32, 34, 52, 41]
  //   }],

  //   yaxis: {
  //     type: 'datetime',
  //     labels: {
  //       style: {
  //         colors: ["#F2F2F2"],
  //       }
  //     },
  //     title: {
  //       style: {
  //         color: "#F2F2F2",
  //       },
  //     },
  //     axisBorder: {
  //       show: true,
  //       color: '#78909C',
  //       height: 1,
  //       width: '100%',
  //       offsetX: 0,
  //       offsetY: 0
  //     },

  //     categories: ["2018-09-19T00:00:00", "2018-09-19T01:30:00", "2018-09-19T02:30:00", "2018-09-19T03:30:00", "2018-09-19T04:30:00", "2018-09-19T05:30:00", "2018-09-19T06:30:00"],
  //   },
  //   tooltip: {
  //     x: {
  //       format: 'dd/MM/yy HH:mm'
  //     },
  //   }
  // }
  // var chart2 = new apex(
  //   document.getElementById("chart2"),
  //   options2
  // );
  // chart2.render();


}

function parseCSV() {
  var filePath = simulationMap["Simulation1"].idf.path.replace(
    simulationMap["Simulation1"].idf.name,
    ""
  );
  var files = fs.readdirSync(filePath + "SimulationResults");

  files.forEach(file => {
    if (process.platform == "win32") {
      var individualSims = fs.readdirSync(
        filePath + "SimulationResults\\" + file
      );
      individualSims.forEach(simFile => {
        if (simFile == "eplusout.csv") {
          //console.log("CSV for " + file + " is " + simFile);
          console.log(filePath + "SimulationResults\\" + file + "\\" + simFile)
          papa.parse(
            fs.createReadStream(filePath + "SimulationResults\\" + file + "\\" + simFile),
            {
              header: true,

              complete: function (results) {
                parsedSimulations.push(results.data);
              }
            }
          );
        }
      });

    } else {
      var individualSims = fs.readdirSync(
        filePath + "SimulationResults/" + file
      );
      individualSims.forEach(simFile => {
        if (simFile == "eplusout.csv") {
          //console.log("CSV for " + file + " is " + simFile);
          console.log(filePath + "SimulationResults/" + file + "/" + simFile)
          papa.parse(
            fs.createReadStream(filePath + "SimulationResults/" + file + "/" + simFile),
            {
              header: true,

              complete: function (results) {
                parsedSimulations.push(results.data);
              }
            }
          );
        }
      });
    }
  });
  console.log(sheet)
  slideToDashboard();

  console.log(parsedSimulations)
}

function slideToDashboard() {
  document.getElementById("dashboard").style = "left: 0px; transition: left 2s;";
  document.getElementById("simulationAdditionPanel").style = "left: -900px; transition: left 2s; position: fixed;";

}

function runSelectedSimulations() {
  createChart();
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

  fs.writeFile("run.sh", data, err => {
    if (err) console.log(err);
    console.log("Successfully Written to File.");
  });
  fs.writeFile("run.bat", data, err => {
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
        //parseCSV();
        createChart();
        waitForSimulations();
      }
    });
    run.on("exit", code => {
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
        parseCSV();
        waitForSimulations();
      }
    });
    run.on("exit", code => {
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

  holder.ondrop = e => {
    e.preventDefault();

    if (e.dataTransfer.files.length > 1) {
      //Multiple file dragged
      holder.style.borderColor = "#F2F2F2";
      plusIcon.style.color = "#F2F2F2";
      importHeader.style.color = "#F2F2F2";

      for (var i = 0; i < e.dataTransfer.files.length; i++) {
        if (
          e.dataTransfer.files[i].name
            .split(".")
            .pop()
            .includes("idf")
        ) {
          idf = e.dataTransfer.files[i];
          console.log("idf file loaded");
        }

        if (
          e.dataTransfer.files[i].name
            .split(".")
            .pop()
            .includes("epw")
        ) {
          epw = e.dataTransfer.files[i];
          console.log("epw file loaded!");
        }
      }
    } else if (
      e.dataTransfer.files[0].name
        .split(".")
        .pop()
        .includes("idf")
    ) {
      console.log("correct file!");
      idf = e.dataTransfer.files[0];
    } else if (
      e.dataTransfer.files[0].name
        .split(".")
        .pop()
        .includes("epw")
    ) {
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
function createChartdiv() {

  var counter = 0;
  var dashboard = document.getElementById("dashboard")
  for (var i = 0; i < 5; i++) {
    var chart = document.createElement("div")
    chart.id = "chart" + counter;
    dashboard.appendChild(chart5);
    counter++;
  }
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
