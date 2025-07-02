const state = {
    nx: 0, ny: 0,
    al: 0, tw: 0,
    py: 0, px: 0,
    epy: 0, epx: 0,
    eny: 0, enx: 0,
    dy: 0, dx: 0,
}
let trafficEnabledY = false;
let trafficEnabledX = true;

let isAmbar = false; 

let timeOutIdXp; //X
let timeOutIdXn; //-X
let timeOutIdYp; //Y
let timeOutIdYn; //-Y

let betterAction;


function getBetterAction(stateString) {
  if (!(stateString in QTABLE)) {
    console.log(`Estado '${stateString}' no encontrado en la Q-table.`);
    return null;
  }

  const acciones = QTABLE[stateString];
  let mejorAccion = null;
  let mejorValor = -Infinity;

  for (const accion in acciones) {
    if (acciones[accion] > mejorValor) {
      mejorValor = acciones[accion];
      mejorAccion = accion;
    }
  }
  return mejorAccion;
}

function weightedRandomChoice(items, weights) {
    const totalWeight = weights.reduce((acc, w) => acc + w, 0);
    const rand = Math.random() * totalWeight;
    let cumulative = 0;

    for (let i = 0; i < items.length; i++) {
        cumulative += weights[i];
        if (rand < cumulative) {
            return items[i];
        }
    }
}


function generateCar(axis, img, type, rail) {
    const carElement = document.createElement("img");
    const intervalLimits = !personArrayImg.includes(type) ? [0.31, 0.33, true] : [0.36, 0.38, false]
    
    carElement.classList.add("car");
    carElement.classList.add("car"+axis);
    carElement.classList.add("car"+axis+"-"+rail);
    carElement.src = "./img/"+img+".png";
    carElement.dataset.passed = "false";


    function monitorPosition() {
      if (!carElement.isConnected) return;
        const pos = translator[axis][0];
        const posValue = parseFloat(getComputedStyle(carElement)[pos]);
        const parentSize = carElement.parentElement["client" + translator[axis][1]];
        const posRatio = posValue / parentSize;

        const isRed = (!trafficEnabledY && axis.includes("Y")) || (!trafficEnabledX && axis.includes("X"));

        let shouldPause = false;

        if (isRed) {
            let siblingRatio = -Infinity;
            if (carElement.previousSibling && carElement.previousSibling.classList.contains("car")) {
                const siblingValue = parseFloat(getComputedStyle(carElement.previousSibling)[pos]);
                siblingRatio = siblingValue / parentSize;
            }

            if ((posRatio >= intervalLimits[0] && posRatio <= intervalLimits[1]) ||
                (posRatio > siblingRatio - 0.05 && posRatio < siblingRatio)) {
                shouldPause = true;
            }
        }

        carElement.style.animationPlayState = shouldPause ? "paused" : "running";

        if (carElement.isConnected) requestAnimationFrame(monitorPosition);
    }

    if (!intervalLimits[2]) {
        // is person
        carElement.classList.add("person"+axis+"-"+rail);
        carElement.classList.add("person"+axis);
        carElement.classList.add("person");
        document.getElementById("pedestrians"+axis+"-"+rail).append(carElement);
    } else {
        carElement.classList.add("carro"+axis);
        document.getElementById("container"+axis+"-"+rail).append(carElement);
    }
    
    carElement.addEventListener("animationend", () => {
        carElement.remove();
    });
    requestAnimationFrame(monitorPosition);
}

function startTrafficFlow(axis, rail, people=false) {
    function spawn() {
        let randomDelay, timeoutId, randomType, randomTypeImg;
        if (people) {
            randomDelay = Math.random() * 15000 + 5000;
            timeoutId = setTimeout(spawn, randomDelay);
    
            randomType = weightedRandomChoice([...personArrayImg], [...personWeightsImg]);
            randomTypeImg = `${randomType}-${Math.floor(Math.random()*imgLen[randomType])+1}`            
        } else {
            randomDelay = Math.random() * 5000 + 2000;
            timeoutId = setTimeout(spawn, randomDelay);
    
            randomType = weightedRandomChoice([...carArrayImg], [...carWeightsImg]);
            randomTypeImg = `${randomType}-${Math.floor(Math.random()*imgLen[randomType])+1}`
        }

        generateCar(axis, randomTypeImg, randomType, rail);

        if (axis === "Y") timeOutIdYp = timeoutId;
        if (axis === "-Y") timeOutIdYn = timeoutId;
        if (axis === "X") timeOutIdXp = timeoutId;
        if (axis === "-X") timeOutIdXn = timeoutId;
    }
    spawn();
}


function updateTrafficStateFromDOM() {
  const axisMap = {
    "Y": ["top", "clientHeight"],
    "-Y": ["bottom", "clientHeight"],
    "X": ["left", "clientWidth"],
    "-X": ["right", "clientWidth"]
  };

  // Inicializar contadores
  const counts = {
    nx: 0,
    ny: 0,
    px: 0,
    py: 0,
    epx: 0,
    epy: 0,
    enx: 0,
    eny: 0,
    dx: 1,
    dy: 1,
  };

  const updateAxis = (axis, type, isPerson) => {
    const className = isPerson ? `.person${axis}` : `.carro${axis}`;
    const elements = document.querySelectorAll(className);
    const [posProp, sizeProp] = axisMap[axis];

    let minDistance = Infinity;
    elements.forEach(el => {
      const parentSize = el.parentElement[sizeProp];
      const pos = parseFloat(getComputedStyle(el)[posProp]);
      const ratio = pos / parentSize;

      const isBeforeCross =
        (axis === "Y" || axis === "-Y") ? (ratio <= 0.34) : (ratio <= 0.34);
      if (isBeforeCross) {
        if (isPerson) {
          counts[`p${axis.at(-1).toLowerCase()}`]++;
          if (el.src.includes("sp")) counts[`ep${axis.at(-1).toLowerCase()}`]++;
        } else {
          counts[`n${axis.at(-1).toLowerCase()}`]++;
          if (el.src.includes("sc")) counts[`en${axis.at(-1).toLowerCase()}`]++;
        }
        if (ratio < minDistance) {
          minDistance = ratio;
        }
      } else {
        if (el.dataset.passed === "false") {
          el.dataset.passed = "true";
          if (isPerson) {
            counts[`p${axis.at(-1).toLowerCase()}`]--;
            if (el.src.includes("sp")) counts[`ep${axis.at(-1).toLowerCase()}`]--;
          } else {
            counts[`n${axis.at(-1).toLowerCase()}`]--;
            if (el.src.includes("sc")) counts[`en${axis.at(-1).toLowerCase()}`]--;
          }
        }
      }
    });
    if (!isPerson) {
      const distProp = axis.at(-1).toLowerCase() === "y" ? "dy" : "dx";
    //   counts[distProp] = 1 - minDistance; // normalizamos distancia
    }
  };

  ["Y", "-Y", "X", "-X"].forEach(axis => {
    updateAxis(axis, "car", false);
    updateAxis(axis, "person", true);
  });
  // Asignar al estado principal
  state.ny = normalizeNumberCars(counts.ny);
  state.nx = normalizeNumberCars(counts.nx);
  state.py = normalizeNumberCars(counts.py);
  state.px = normalizeNumberCars(counts.px);
  state.epy = counts.epy > 0 ? 1 : 0;
  state.epx = counts.epx > 0 ? 1 : 0;
  state.eny = counts.eny > 0 ? 1 : 0;
  state.enx = counts.enx > 0 ? 1 : 0;
  state.dy = counts.dy;
  state.dx = counts.dx;
}

setInterval(() => {
  updateTrafficStateFromDOM();
  
  const { nx, ny, al, tw, py, px, epy, epx, eny, enx, dy, dx } = state;
  const stateString = `${ny}_${nx}_${al}_${normalizeTime(tw)}_${py}_${px}_${epy}_${epx}_${eny}_${enx}_${dy}_${dx}`;
  const lastBetterAction = betterAction;
  betterAction = getBetterAction(stateString);

  console.log(stateString + ": " + betterAction + " -> x:" + trafficEnabledX + " y:" + trafficEnabledY)
  if (lastBetterAction === betterAction) return;
  if (betterAction) {
    if (betterAction === "green_X") {
      if (isAmbar) return;
      trafficEnabledX = false;
      trafficEnabledY = false;
      isAmbar = true;
      setTimeout(() => {
        trafficEnabledX = true;
        trafficEnabledY = false;
        state.al = 0;
        state.tw = 0;
        isAmbar = false;
      }, 1500);
    } else {
      if (isAmbar) return;
      trafficEnabledX = false;
      trafficEnabledY = false;
      isAmbar = true;
      setTimeout(() => {
        trafficEnabledX = false;
        trafficEnabledY = true;
        state.al = 1;
        state.tw = 0;
        isAmbar = false;
      }, 1500);
    }
  }
  // Aumentar tiempo de espera si semáforo está en rojo para una dirección
  if (!trafficEnabledX) state.tw++;
  if (!trafficEnabledY) state.tw++;
}, 500);

startTrafficFlow("Y", 1);
startTrafficFlow("Y", 2);
startTrafficFlow("-Y", 1);
startTrafficFlow("-Y", 2);
startTrafficFlow("X", 1);
startTrafficFlow("X", 2);
startTrafficFlow("-X", 1);
startTrafficFlow("-X", 2);

startTrafficFlow("Y", 1, true);
startTrafficFlow("Y", 2, true);
startTrafficFlow("-Y", 1, true);
startTrafficFlow("-Y", 2, true);
startTrafficFlow("X", 1, true);
startTrafficFlow("X", 2, true);
startTrafficFlow("-X", 1, true);
startTrafficFlow("-X", 2, true);

