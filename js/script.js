
let isChanging = false;

setInterval(() => {
  if (isAmbar || isChanging) return;

  Generator.agent.normalizeData();

  const { nx, ny, al, tw, py, px, spy, spx, scy, scx, dy, dx } = Generator.agent.state;
  const newStateString = `${ny}_${nx}_${al}_${normalizeTime(tw)}_${py}_${px}_${spy}_${spx}_${scy}_${scx}_${dy}_${dx}`;
  const newBetterAction = Generator.agent.getBetterAction(newStateString);

  if (newBetterAction && newBetterAction !== betterAction) {
    betterAction = newBetterAction;
    isAmbar = true;
    isChanging = true;
    trafficEnabledX = false;
    trafficEnabledY = false;

    setTimeout(() => {
      if (betterAction === "green_X") {
        trafficEnabledX = true;
        trafficEnabledY = false;
        Generator.agent.state.al = 0;
      } else {
        trafficEnabledX = false;
        trafficEnabledY = true;
        Generator.agent.state.al = 1;
      }
      Generator.agent.state.tw = 0;
      isAmbar = false;
      isChanging = false;
    }, 1500);
  }

  // Aumenta tiempo si semáforo está en rojo
  if (!trafficEnabledX || !trafficEnabledY) Generator.agent.state.tw++;

}, 300);

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

