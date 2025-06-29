const state = {
    nx: 0,
    ny: 0,
    al: 0,
    tw: 2,
    py: 0,
    px: 0,
    epy: 0,
    epx: 0,
    eny: 0,
    enx: 0,
    dy: 1,
    dx: 1,
}

let trafficEnabledY = false;
let trafficEnabledX = true;

let isAmbar = false;

let timeOutIdXp; //X
let timeOutIdXn; //-X
let timeOutIdYp; //Y
let timeOutIdYn; //-Y

let betterAction;

const imgLen = {
    car: 5,
    person: 7,
    sc: 3,
    sp: 1,
}

const translator = {
    "Y" : ["top", "Height"],
    "-Y" : ["bottom", "Height"],
    "X" : ["left", "Width"],
    "-X" : ["right", "Width"],
}

const carArrayImg = ["car", "sc"];
const carWeightsImg = [0.95, 0.05]

const personArrayImg = ["person", "sp"];
const personWeightsImg = [0.95, 0.05]

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
  console.log(state)
  console.log(stateString)
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
    const axisLower = axis.at(axis.length-1).toLowerCase();
    const carElement = document.createElement("img");
    const intervalLimits = !personArrayImg.includes(type) ? [0.31, 0.33, true] : [0.36, 0.38, false]
    
    carElement.classList.add("car");
    carElement.classList.add("car"+axis);
    carElement.classList.add("car"+axis+"-"+rail);
    carElement.src = "./img/"+img+".png";


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
        carElement.style.animationPlayState = shouldPause?"pause":"running";

        if (posRatio > intervalLimits[1]) {
            if (!intervalLimits[2]) {
                state["p"+axisLower]--;
                if (type === "sp") {
                    state["ep"+axisLower]--;
                }
            } else {
                state["n"+axisLower]--;
                if (type === "sc") {
                    state["en"+axisLower]--;
                }
            }
        }

        if (carElement.isConnected) requestAnimationFrame(monitorPosition);
    }

    if (!intervalLimits[2]) { // is person        
        carElement.classList.add("person"+axis+"-"+rail);
        carElement.classList.add("person");
        document.getElementById("pedestrians"+axis+"-"+rail).append(carElement);
        state["p"+axisLower]++;
        if (type === "sp") {
            state["ep"+axisLower]++;
        }
    } else {        
        document.getElementById("container"+axis+"-"+rail).append(carElement);
        state["n"+axisLower]++;
        if (type === "sc") {
            state["en"+axisLower]++;
        }
    }
    
    carElement.addEventListener("animationend", () => {
        carElement.remove();        
    });
    requestAnimationFrame(monitorPosition);
}


document.addEventListener("click", () => {
    if (isAmbar) return;

    let newTrafficEnabledX = !trafficEnabledX;
    let newTrafficEnabledY = !trafficEnabledY;

    trafficEnabledX = false;
    trafficEnabledY = false;
    isAmbar = true;

    setTimeout(() => {
        trafficEnabledX = newTrafficEnabledX;
        trafficEnabledY = newTrafficEnabledY;
        state.al = trafficEnabledY ? 1 : 0;
        isAmbar = false;
    }, 3000); 
});

function startTrafficFlow(axis, rail, people=false) {
    function spawn() {
        let randomDelay, timeoutId, randomType, randomTypeImg;
        if (people) {
            randomDelay = Math.random() * 15000 + 6000;
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

function normalizeNumberCars(n) {
    if (n <= 0) { return 0; }
    if (n < 8) { return 1; }
    if (n < 16) { return 2; }
    return 3;
}


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

setInterval(() => {
    let { nx, ny, al, tw, py, px, epy, epx, eny, enx, dy, dx, } = state;
    nx = normalizeNumberCars(nx);
    ny = normalizeNumberCars(ny);
    px = normalizeNumberCars(px);
    py = normalizeNumberCars(py);
    epy = epy > 0 ? 1 : 0;
    epx = epx > 0 ? 1 : 0;
    eny = eny > 0 ? 1 : 0;
    enx = enx > 0 ? 1 : 0;
    const lastBetterAction = betterAction;
    betterAction = getBetterAction(`${ny}_${nx}_${al}_${tw}_${py}_${px}_${epy}_${epx}_${eny}_${enx}_${dy}_${dx}`);
    if (lastBetterAction === betterAction) {
        return
    }
    if (betterAction) {
        if (betterAction === "green_EW") {
            if (isAmbar) return;

            trafficEnabledX = false;
            trafficEnabledY = false;
            isAmbar = true;

            setTimeout(() => {
                trafficEnabledX = true;
                trafficEnabledY = false;
                state.al = trafficEnabledY ? 1 : 0;
                isAmbar = false;
            }, 3000); 
        } else if (betterAction === "green_NS") {
            if (isAmbar) return;

            trafficEnabledX = false;
            trafficEnabledY = false;
            isAmbar = true;

            setTimeout(() => {
                trafficEnabledX = false;
                trafficEnabledY = true;
                state.al = trafficEnabledY ? 1 : 0;
                isAmbar = false;
            }, 3000); 
        }
    }
}, 1000);