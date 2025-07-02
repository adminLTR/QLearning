
setInterval(() => {
  if (!trafficEnabledX) Generator.agent.state.tw++;
  if (!trafficEnabledY) Generator.agent.state.tw++;

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

