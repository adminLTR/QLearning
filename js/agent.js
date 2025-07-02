
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
                    if (el.dataset.counted === "false") {
                        el.dataset.counted = "true"
                        if (isPerson) {
                            this.counts[`p${axis.at(-1).toLowerCase()}`]++; // pedestrians
                            if (el.src.includes("sp")) { // special pedestrians
                                this.counts[`sp${axis.at(-1).toLowerCase()}`]++;
                            }
                        } else {
                            this.counts[`n${axis.at(-1).toLowerCase()}`]++; // cars
                            if (el.src.includes("sc")) {
                                this.counts[`sc${axis.at(-1).toLowerCase()}`]++
                            };
                        }
                        if (ratio < minDistance) {
                            minDistance = ratio;
                        }
                    }
                } else {
                    if (el.dataset.passed === "false") {
                        el.dataset.passed = "true";
                        if (isPerson) {
                            this.counts[`p${axis.at(-1).toLowerCase()}`]--;
                            if (el.src.includes("sp")) {
                                this.counts[`sp${axis.at(-1).toLowerCase()}`]--
                            };
                        } else {
                            this.counts[`n${axis.at(-1).toLowerCase()}`]--;
                            if (el.src.includes("sc")) {
                                this.counts[`sc${axis.at(-1).toLowerCase()}`]--
                            };
                        }
                    }
                }
            });
            if (!isPerson) {
                const distProp = axis.at(-1).toLowerCase() === "y" ? "dy" : "dx";
                this.counts[distProp] = minDistance; // normalizamos distancia
                // console.log(this.counts[distProp])
            }
        };

        ["Y", "-Y", "X", "-X"].forEach(axis => {
            updateAxis(axis, "car");
            updateAxis(axis, "person");
        });
        // Asignar al estado principal
        this.state.ny = normalizeNumberCars(this.counts.ny);
        this.state.nx = normalizeNumberCars(this.counts.nx);
        this.state.py = normalizeNumberCars(this.counts.py);
        this.state.px = normalizeNumberCars(this.counts.px);
        this.state.spy = this.counts.spy > 0 ? 1 : 0;
        this.state.spx = this.counts.spx > 0 ? 1 : 0;
        this.state.scy = this.counts.scy > 0 ? 1 : 0;
        this.state.scx = this.counts.scx > 0 ? 1 : 0;
        this.state.dy = normalizeDistance(this.counts.dy);
        this.state.dx = normalizeDistance(this.counts.dx);
    }
}