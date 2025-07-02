let trafficEnabledY = false;
let trafficEnabledX = true;

let isAmbar = false; 

let timeOutIdXp, timeOutIdXn;
let timeOutIdYp, timeOutIdYn;

let betterAction;

const agent = new Agent();

function startTrafficFlow(axis, rail, people=false) {
    function spawn() {
        let randomDelay, timeoutId, randomType, randomTypeImg;
        let config = people ? CONFIG.person : CONFIG.car;
  
        randomDelay = Math.random() * config.time.max + config.time.min;
        timeoutId = setTimeout(spawn, randomDelay);

        randomType = Generator.choice(
          ["normal", "special"], 
          [config.normal.weight, config.special.weight]
        );
        randomTypeImg = `${config[randomType].label}-${Math.floor(Math.random()*config[randomType].lenImg)+1}`            

        Generator.generateElement(axis, randomTypeImg, randomType, rail);

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
    nx: 0, ny: 0,
    px: 0, py: 0,
    spx: 0, spy: 0,
    scx: 0, scy: 0,
    dx: 0, dy: 0,
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
          if (el.src.includes("sp")) counts[`sp${axis.at(-1).toLowerCase()}`]++;
        } else {
          counts[`n${axis.at(-1).toLowerCase()}`]++;
          if (el.src.includes("sc")) counts[`sc${axis.at(-1).toLowerCase()}`]++;
        }
        if (ratio < minDistance) {
          minDistance = ratio;
        }
      } else {
        if (el.dataset.passed === "false") {
          el.dataset.passed = "true";
          if (isPerson) {
            counts[`p${axis.at(-1).toLowerCase()}`]--;
            if (el.src.includes("sp")) counts[`sp${axis.at(-1).toLowerCase()}`]--;
          } else {
            counts[`n${axis.at(-1).toLowerCase()}`]--;
            if (el.src.includes("sc")) counts[`sc${axis.at(-1).toLowerCase()}`]--;
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
  agent.state.ny = normalizeNumberCars(counts.ny);
  agent.state.nx = normalizeNumberCars(counts.nx);
  agent.state.py = normalizeNumberCars(counts.py);
  agent.state.px = normalizeNumberCars(counts.px);
  agent.state.spy = counts.spy > 0 ? 1 : 0;
  agent.state.spx = counts.spx > 0 ? 1 : 0;
  agent.state.scy = counts.scy > 0 ? 1 : 0;
  agent.state.scx = counts.scx > 0 ? 1 : 0;
  agent.state.dy = counts.dy;
  agent.state.dx = counts.dx;
}

setInterval(() => {
  if (!trafficEnabledX) agent.state.tw++;
  if (!trafficEnabledY) agent.state.tw++;
  if (isAmbar) return;
  updateTrafficStateFromDOM();
  
  const { nx, ny, al, tw, py, px, spy, spx, scy, scx, dy, dx } = agent.state;
  const stateString = `${ny}_${nx}_${al}_${normalizeTime(tw)}_${py}_${px}_${spy}_${spx}_${scy}_${scx}_${dy}_${dx}`;
  const lastBetterAction = betterAction;
  betterAction = agent.getBetterAction(stateString);

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
        agent.state.al = 0;
        agent.state.tw = 0;
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
        agent.state.al = 1;
        agent.state.tw = 0;
        isAmbar = false;
      }, 1500);
    }
  }
  // Aumentar tiempo de espera si semáforo está en rojo para una dirección
  
}, 500);

startTrafficFlow("Y", 1);
startTrafficFlow("Y", 2);
startTrafficFlow("-Y", 1);
startTrafficFlow("-Y", 2);
startTrafficFlow("X", 1);
startTrafficFlow("X", 2);
startTrafficFlow("-X", 1);
startTrafficFlow("-X", 2);

// startTrafficFlow("Y", 1, true);
// startTrafficFlow("Y", 2, true);
// startTrafficFlow("-Y", 1, true);
// startTrafficFlow("-Y", 2, true);
// startTrafficFlow("X", 1, true);
// startTrafficFlow("X", 2, true);
// startTrafficFlow("-X", 1, true);
// startTrafficFlow("-X", 2, true);

