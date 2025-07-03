
let isChanging = false;

document.getElementById("btn-Y").addEventListener("click", ()=>{generateSpecial = 'Y'})
document.getElementById("btn-X").addEventListener("click", ()=>{generateSpecial = 'X'})

function updateCrossLight(verticalColor, horizontalColor) {
  const vertical = document.getElementById('light-vertical');
  const horizontal = document.getElementById('light-horizontal');

  if (vertical) vertical.style.backgroundColor = verticalColor;
  if (horizontal) horizontal.style.backgroundColor = horizontalColor;
}

setInterval(() => {
  if (isAmbar || isChanging) {
    updateCrossLight('orange', 'orange');
    return;
  }

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
    
    updateCrossLight('orange', 'orange');

    setTimeout(() => {
      if (betterAction === "green_X") {
        trafficEnabledX = true;
        trafficEnabledY = false;
        Generator.agent.state.al = 0;
        updateCrossLight('red', 'green');
      } else {
        trafficEnabledX = false;
        trafficEnabledY = true;
        Generator.agent.state.al = 1;
        updateCrossLight('green', 'red');
      }
      Generator.agent.state.tw = 0;
      isAmbar = false;
      isChanging = false;
    }, 3000);
  } else {
    // Mantener luces si no hay cambio
    if (trafficEnabledX && !trafficEnabledY) {
      updateCrossLight('red', 'green');
    } else if (!trafficEnabledX && trafficEnabledY) {
      updateCrossLight('green', 'red');
    }
  }

  // Aumenta tiempo si semáforo está en rojo
  if (!trafficEnabledX || !trafficEnabledY) Generator.agent.state.tw++;

}, 1000);

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

