
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
}