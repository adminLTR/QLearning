
/**
 * Clase Agent
 * 
 * Representa el agente inteligente encargado de tomar decisiones 
 * sobre el cambio de luces en un sistema de semáforo inteligente.
 * Utiliza una tabla Q (`QTABLE`) para decidir la mejor acción posible
 * según el estado actual del entorno.
 */
class Agent {
    /**
     * Estado actual del entorno, usado como entrada del modelo Q-learning.
     * Cada propiedad representa una característica relevante para la decisión:
     * - nx, ny: Cantidad de autos en los ejes X y Y.
     * - al: Luz actual activa (0 para eje X, 1 para eje Y).
     * - tw: Tiempo acumulado de espera de los vehículos.
     * - px, py: Cantidad de peatones esperando en X e Y.
     * - spx, spy: Peatones especiales (por ejemplo, niños, ancianos) en X e Y.
     * - scx, scy: Vehículos especiales (por ejemplo, ambulancias) en X e Y.
     * - dx, dy: Distancia del vehículo más cercano al cruce en X e Y.
     */
    state = {
        nx: 0, ny: 0,
        al: 0, tw: 0,
        py: 0, px: 0,
        spy: 0, spx: 0,
        scy: 0, scx: 0,
        dy: 0, dx: 0,
    }

    /**
     * Contadores crudos para los elementos presentes en la intersección.
     * Estos valores se actualizan en tiempo real y luego son normalizados
     * para alimentar el `state`.
     */
    counts = {
        nx: 0, ny: 0,
        px: 0, py: 0,
        spx: 0, spy: 0,
        scx: 0, scy: 0,
        dx: 0, dy: 0,
    };

    /**
     * Obtiene la mejor acción (por ejemplo, encender luz verde en eje X o Y)
     * basada en la tabla Q y el estado actual representado como cadena.
     *
     * @param {string} stateString - Estado actual serializado, con formato:
     * `"ny_nx_al_tw_py_px_spy_spx_scy_scx_dy_dx"`.
     * 
     * @returns {string|null} Acción con mayor valor Q, o `null` si el estado no existe.
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

    /**
     * Normaliza los datos de conteo crudo (`counts`) y actualiza el estado (`state`).
     * Esta función es clave para transformar el entorno en una representación discreta
     * adecuada para el algoritmo Q-learning.
     */
    normalizeData() {
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

    /**
     * Actualiza visualmente en el DOM los conteos actuales de autos y peatones
     * en ambos ejes X e Y. Función útil para monitoreo o depuración del sistema.
     */
    viewData() {
        document.getElementById("nx").textContent = this.counts.nx;
        document.getElementById("ny").textContent = this.counts.ny;
        document.getElementById("px").textContent = this.counts.px;
        document.getElementById("py").textContent = this.counts.py;
    }

}