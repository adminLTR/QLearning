

const agent = new Agent();


function updateTrafficStateFromDOM() {
  
  const updateAxis = (axis, type) => {
    const isPerson = type === "person";
    const className = isPerson ? `.person${axis}` : `.carro${axis}`;
    const elements = document.querySelectorAll(className);
    const {side, client} = TRANSLATOR[axis];

    let minDistance = Infinity;
    elements.forEach(el => {
      const parentSize = el.parentElement[client];
      const pos = parseFloat(getComputedStyle(el)[side]);
      const ratio = pos / parentSize;

      const isBeforeCross =
        (axis === "Y" || axis === "-Y") ? (ratio <= 0.34) : (ratio <= 0.34);
      if (isBeforeCross) {
        if (isPerson) {
          agent.counts[`p${axis.at(-1).toLowerCase()}`]++;
          if (el.src.includes("sp")) agent.counts[`sp${axis.at(-1).toLowerCase()}`]++;
        } else {
          agent.counts[`n${axis.at(-1).toLowerCase()}`]++;
          if (el.src.includes("sc")) agent.counts[`sc${axis.at(-1).toLowerCase()}`]++;
        }
        if (ratio < minDistance) {
          minDistance = ratio;
        }
      } else {
        if (el.dataset.passed === "false") {
          el.dataset.passed = "true";
          if (isPerson) {
            agent.counts[`p${axis.at(-1).toLowerCase()}`]--;
            if (el.src.includes("sp")) agent.counts[`sp${axis.at(-1).toLowerCase()}`]--;
          } else {
            agent.counts[`n${axis.at(-1).toLowerCase()}`]--;
            if (el.src.includes("sc")) agent.counts[`sc${axis.at(-1).toLowerCase()}`]--;
          }
        }
      }
    });
    if (!isPerson) {
      const distProp = axis.at(-1).toLowerCase() === "y" ? "dy" : "dx";
    //   agent.counts[distProp] = 1 - minDistance; // normalizamos distancia
    }
  };

  ["Y", "-Y", "X", "-X"].forEach(axis => {
    updateAxis(axis, "car");
    updateAxis(axis, "person");
  });
  // Asignar al estado principal
  agent.state.ny = normalizeNumberCars(agent.counts.ny);
  agent.state.nx = normalizeNumberCars(agent.counts.nx);
  agent.state.py = normalizeNumberCars(agent.counts.py);
  agent.state.px = normalizeNumberCars(agent.counts.px);
  agent.state.spy = agent.counts.spy > 0 ? 1 : 0;
  agent.state.spx = agent.counts.spx > 0 ? 1 : 0;
  agent.state.scy = agent.counts.scy > 0 ? 1 : 0;
  agent.state.scx = agent.counts.scx > 0 ? 1 : 0;
  agent.state.dy = agent.counts.dy;
  agent.state.dx = agent.counts.dx;
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

Generator.startTrafficFlow("Y", 1);
Generator.startTrafficFlow("Y", 2);
Generator.startTrafficFlow("-Y", 1);
Generator.startTrafficFlow("-Y", 2);
Generator.startTrafficFlow("X", 1);
Generator.startTrafficFlow("X", 2);
Generator.startTrafficFlow("-X", 1);
Generator.startTrafficFlow("-X", 2);

Generator.startTrafficFlow("Y", 1, true);
Generator.startTrafficFlow("Y", 2, true);
Generator.startTrafficFlow("-Y", 1, true);
Generator.startTrafficFlow("-Y", 2, true);
Generator.startTrafficFlow("X", 1, true);
Generator.startTrafficFlow("X", 2, true);
Generator.startTrafficFlow("-X", 1, true);
Generator.startTrafficFlow("-X", 2, true);

