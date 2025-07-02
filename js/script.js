const agent = new Agent();

setInterval(() => {
  if (!trafficEnabledX) agent.state.tw++;
  if (!trafficEnabledY) agent.state.tw++;
  if (isAmbar) return;
  agent.updateTrafficStateFromDOM();
  
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

