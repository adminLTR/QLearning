
class Agent {
    state = {
        nx: 0, ny: 0,
        al: 0, tw: 0,
        py: 0, px: 0,
        spy: 0, spx: 0,
        scy: 0, scx: 0,
        dy: 0, dx: 0,
    }

    counts = {
        nx: 0, ny: 0,
        px: 0, py: 0,
        spx: 0, spy: 0,
        scx: 0, scy: 0,
        dx: 0, dy: 0,
    };

    /**
     * Decides which is the best action according to highest value in QTable
     * @param {string} stateString State string in format "{ny}_{nx}_{al}_{tw}_{py}_{px}_{epy}_{epx}_{eny}_{enx}_{dy}_{dx}"
     * @returns Better action selected
     */
    getBetterAction(stateString) {
        if (!(stateString in QTABLE)) {
            console.log(`Status '${stateString}' not found.`);
            return null;
        }

        const actions = QTABLE[stateString];
        let betterAction = null;
        let betterValue = -Infinity;

        for (const action in actions) {
            if (actions[action] > betterValue) {
                betterValue = actions[action];
                betterAction = action;
            }
        }
        return betterAction;
    }

    updateTrafficStateFromDOM() {
  
        const updateAxis = (axis, type) => {
            const isPerson = type === "person";
            const className = isPerson ? `.person${axis}` : `.carro${axis}`;
            const elements = document.querySelectorAll(className);
            const {side, client} = TRANSLATOR[axis];
            const config = isPerson ? CONFIG.person : CONFIG.car

            let minDistance = Infinity;
                elements.forEach(el => {
                const parentSize = el.parentElement[client];
                const pos = parseFloat(getComputedStyle(el)[side]);
                const ratio = pos / parentSize;

                const isBeforeCross =  ratio < config.intervals.max
                if (isBeforeCross) {
                    if (isPerson) {
                        agent.counts[`p${axis.at(-1).toLowerCase()}`]++; // pedestrians
                        if (el.src.includes("sp")) { // special pedestrians
                            agent.counts[`sp${axis.at(-1).toLowerCase()}`]++;
                        }
                    } else {
                        agent.counts[`n${axis.at(-1).toLowerCase()}`]++; // cars
                        if (el.src.includes("sc")) {
                            agent.counts[`sc${axis.at(-1).toLowerCase()}`]++
                        };
                    }
                    if (ratio < minDistance) {
                        minDistance = ratio;
                    }
                } else {
                    if (el.dataset.passed === "false") {
                        el.dataset.passed = "true";
                        if (isPerson) {
                            agent.counts[`p${axis.at(-1).toLowerCase()}`]--;
                            if (el.src.includes("sp")) {
                                agent.counts[`sp${axis.at(-1).toLowerCase()}`]--
                            };
                        } else {
                            agent.counts[`n${axis.at(-1).toLowerCase()}`]--;
                            if (el.src.includes("sc")) {
                                agent.counts[`sc${axis.at(-1).toLowerCase()}`]--
                            };
                        }
                    }
                }
            });
            if (!isPerson) {
                const distProp = axis.at(-1).toLowerCase() === "y" ? "dy" : "dx";
                agent.counts[distProp] = minDistance; // normalizamos distancia
                // console.log(agent.counts[distProp])
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
        agent.state.dy = normalizeDistance(agent.counts.dy);
        agent.state.dx = normalizeDistance(agent.counts.dx);
    }
}