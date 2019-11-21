var isOpen = false;
var idf;
var epw;
var fs = require("fs");

var simulationMap = {};
var simulationCount = 0;
var data = "";


const exec = require('child_process').exec;

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

function runSelectedSimulations() {
  var filePath = simulationMap["Simulation" + simulationCount].idf.path.replace(simulationMap["Simulation" + simulationCount].idf.name, '');
  data = "cd " + filePath + "\n" + "mkdir SimulationResults" + "\n" + "cd SimulationResults" + "\n" + "energyplus -w " + simulationMap["Simulation" + simulationCount].epw.path + " -r " + simulationMap["Simulation" + simulationCount].idf.path;
  console.log(simulationMap["Simulation" + simulationCount].epw.path);
  fs.writeFile("run.sh", data, (err) => {
    if (err) console.log(err);
    console.log("Successfully Written to File.");
  });

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
    holder.style.borderColor = "#F27405";
    plusIcon.style.color = "#F27405";
    importHeader.style.color = "#F27405";
    return false;
  };

  holder.ondragleave = () => {
    holder.style.borderColor = "#A6A6A6";
    plusIcon.style.color = "#A6A6A6";
    importHeader.style.color = "#A6A6A6";
    return false;
  };

  holder.ondragend = () => {
    holder.style.borderColor = "#A6A6A6";
    plusIcon.style.color = "#A6A6A6";
    importHeader.style.color = "#A6A6A6";
    return false;
  };

  holder.ondrop = e => {
    e.preventDefault();

    if (e.dataTransfer.files.length > 1) {
      //Multiple file dragged
      holder.style.borderColor = "#A6A6A6";
      plusIcon.style.color = "#A6A6A6";
      importHeader.style.color = "#A6A6A6";

      for (var i = 0; i < e.dataTransfer.files.length; i++) {
        if (e.dataTransfer.files[i].name.split('.').pop().includes("idf")) {
          idf = e.dataTransfer.files[i];
          console.log("idf file loaded");
        }

        if (e.dataTransfer.files[i].name.split('.').pop().includes("epw")) {
          epw = e.dataTransfer.files[i];
          console.log("epw file loaded!");
        }
      }

    } else if (e.dataTransfer.files[0].name.split('.').pop().includes("idf")) {
      console.log("correct file!");
      idf = e.dataTransfer.files[0];
    } else if (e.dataTransfer.files[0].name.split('.').pop().includes("epw")) {
      console.log("correct file!");
      epw = e.dataTransfer.files[0];
    }

    if (idf == null && epw == null) {
      importHeader.textContent = "Only drag .idf and .epw file";
      holder.style.borderColor = "#A6A6A6";
      plusIcon.style.color = "#A6A6A6";
      importHeader.style.color = "#A6A6A6";
      detectDrop();
    }
    else if (idf == null) {
      importHeader.textContent = "Please drag .idf file";
      holder.style.borderColor = "#A6A6A6";
      plusIcon.style.color = "#A6A6A6";
      importHeader.style.color = "#A6A6A6";
      detectDrop();
    }
    else if (epw == null) {
      importHeader.textContent = "Please drag .epw file";
      holder.style.borderColor = "#A6A6A6";
      plusIcon.style.color = "#A6A6A6";
      importHeader.style.color = "#A6A6A6";
      detectDrop();
    }
    else {
      simulationCount++;

      simulationMap["Simulation" + simulationCount] = new SimulationObject(idf, epw);

      createSimulationVisualElement();

      isRunnable();

      toggleBlur();
    }

    return false;
  };
}

function removeSimulation(simId) {
  console.log("Remove Simulation " + simId);
  document.getElementById("sim" + (simId)).remove();

  if (document.getElementById("sim" + (simId + 1)) != null) {
    document.getElementById("sim" + (simId + 1)).getElementsByTagName('h2')[0].textContent = "Simulation " + (simId);
    document.getElementById("sim" + (simId + 1)).setAttribute("onclick", "removeSimulation(" + simId + ")");
    document.getElementById("sim" + (simId + 1)).id = "sim" + simId;
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

  } else {
    document.getElementById("importScreen").style.display = "block";
    document.getElementById("addSim").style = " filter: blur(8px);-webkit-filter: blur(8px);"
    document.getElementById("runSim").style = " filter: blur(8px);-webkit-filter: blur(8px);"
    document.getElementById("simulations").style = " filter: blur(8px);-webkit-filter: blur(8px);"

  }
  isOpen = !isOpen;
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