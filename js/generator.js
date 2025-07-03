/**
 * Clase Generator
 * 
 * Esta clase se encarga de generar dinámicamente los elementos del entorno,
 * como vehículos y peatones, y monitorear su movimiento dentro de la intersección.
 * También controla el flujo de tráfico mediante la creación periódica de nuevos elementos.
 */
class Generator {
    
    /** Identificadores de timeout para cada dirección, utilizados para detener el flujo si es necesario. */
    static timeOutIdXp = 0; static timeOutIdXn = 0;
    static timeOutIdYp = 0; static timeOutIdYn = 0;

    /** Instancia del agente responsable de la toma de decisiones. */
    static agent = new Agent();
    
    /**
     * Selecciona aleatoriamente un ítem de una lista, considerando probabilidades asignadas.
     * 
     * @param {string[]} items - Lista de elementos a seleccionar.
     * @param {number[]} weights - Lista de pesos correspondientes a cada elemento.
     * @returns {string} - Elemento seleccionado aleatoriamente según los pesos.
     */
    static choice(items, weights) {
        const totalWeight = weights.reduce((acc, w) => acc + w, 0);
        const rand = Math.random() * totalWeight;
        let cumulative = 0;

        for (let i = 0; i < items.length; i++) {
            cumulative += weights[i];
            if (rand < cumulative) {
                return items[i];
            }
        }
    }

    /**
     * Genera un nuevo elemento visual (vehículo o peatón) que se moverá por la intersección.
     * 
     * @param {string} axis - Eje de movimiento del elemento: "X", "-X", "Y" o "-Y".
     * @param {string} img - Nombre del archivo de imagen a usar (sin extensión).
     * @param {string} type - Tipo del elemento: "car", "sc", "person", o "sp".
     * @param {number} rail - Identificador del carril por el que se moverá.
     */
    static generateElement(axis, img, type, rail) {
        const isPerson = [CONFIG.person.special.label, CONFIG.person.normal.label].includes(type)
        const config = isPerson ? CONFIG.person : CONFIG.car; 

        const element = document.createElement("img");
        element.classList.add("car");
        element.classList.add("car"+axis);
        element.classList.add("car"+axis+"-"+rail);
        element.src = "./img/"+img+".png";
        element.dataset.passed = "false";
        element.dataset.counted = "false";

        /**
         * Función interna que monitorea en cada frame la posición del elemento y
         * toma decisiones como pausar la animación si el semáforo está en rojo,
         * actualizar los conteos del agente, y eliminar el elemento al finalizar su recorrido.
         */
        function monitorPosition() {
            if (!element.isConnected) return;
            const side = TRANSLATOR[axis].side;
            const sideValue = parseFloat(getComputedStyle(element)[side]);
            const parentSize = element.parentElement[TRANSLATOR[axis].client];
            const posRatio = sideValue / parentSize;

            const isRed = (!trafficEnabledY && axis.includes("Y")) || (!trafficEnabledX && axis.includes("X"));

            let shouldPause = false;

            if (isRed) {
                let siblingRatio = -Infinity;
                if (element.previousSibling && element.previousSibling.classList.contains("car")) {
                    const siblingValue = parseFloat(getComputedStyle(element.previousSibling)[side]);
                    siblingRatio = siblingValue / parentSize;
                }

                if ((posRatio >= config.intervals.min && posRatio <= config.intervals.max) ||
                    (posRatio > siblingRatio - 0.05 && posRatio < siblingRatio)) {
                    shouldPause = true;
                }
            }

            element.style.animationPlayState = shouldPause ? "paused" : "running";
            // Generator.agent.viewData()
            if (!isAmbar) {
                // Generator.agent.updateTrafficStateFromDOM();
                let minDistance = Infinity;
                const isBeforeCross =  posRatio < config.intervals.max;

                
                if (isBeforeCross) {
                    if (element.dataset.counted === "false") {
                        element.dataset.counted = "true"
                        if (isPerson) {
                            Generator.agent.counts[`p${axis.at(-1).toLowerCase()}`]++; // pedestrians
                            if (element.src.includes("sp")) { // special pedestrians
                                Generator.agent.counts[`sp${axis.at(-1).toLowerCase()}`]++;
                            }
                        } else {
                            Generator.agent.counts[`n${axis.at(-1).toLowerCase()}`]++; // cars
                            if (element.src.includes("sc")) {
                                Generator.agent.counts[`sc${axis.at(-1).toLowerCase()}`]++
                            };
                        }
                    }
                    if (posRatio < minDistance) {
                        minDistance = posRatio;
                    }
                } else {
                    if (element.dataset.passed === "false") {
                        element.dataset.passed = "true";
                        if (isPerson) {
                            Generator.agent.counts[`p${axis.at(-1).toLowerCase()}`]--;
                            if (element.src.includes("sp")) {
                                Generator.agent.counts[`sp${axis.at(-1).toLowerCase()}`]--
                            };
                        } else {
                            Generator.agent.counts[`n${axis.at(-1).toLowerCase()}`]--;
                            if (element.src.includes("sc")) {
                                Generator.agent.counts[`sc${axis.at(-1).toLowerCase()}`]--
                            };
                        }
                    }
                }

                
                if (!isPerson) {
                    const distProp = axis.at(-1).toLowerCase() === "y" ? "dy" : "dx";
                    Generator.agent.counts[distProp] = minDistance; // normalizamos distancia
                    // console.log(Generator.agent.counts[distProp])
                }
            }
            
            if (element.isConnected) requestAnimationFrame(monitorPosition);
        }

        
        if (isPerson) {
            element.classList.add("person"+axis+"-"+rail);
            element.classList.add("person"+axis);
            element.classList.add("person");
            document.getElementById("pedestrians"+axis+"-"+rail).append(element);
        } else {
            element.classList.add("carro"+axis);
            document.getElementById("container"+axis+"-"+rail).append(element);
        }
        
        
        element.addEventListener("animationend", () => {
            element.remove();
        });
        
        requestAnimationFrame(monitorPosition);
    }

    /**
     * Inicia el flujo de generación continua de vehículos o peatones sobre un carril específico.
     * 
     * @param {string} axis - Eje de dirección del flujo: "X", "-X", "Y" o "-Y".
     * @param {number} rail - Identificador del carril.
     * @param {boolean} [people=false] - Si es true, genera peatones; si es false, vehículos.
     */
    static startTrafficFlow(axis, rail, people=false) {
        function spawn() {
            let randomDelay, timeoutId, randomType, randomTypeImg;
            let config = people ? CONFIG.person : CONFIG.car;
    
            randomDelay = Math.random() * config.time.max + config.time.min;
            timeoutId = setTimeout(spawn, randomDelay);

            if (axis.includes(generateSpecial) && generateSpecial !== '') {
                randomType = "special";
                generateSpecial = ''
            } else {
                randomType = Generator.choice(
                    ["normal", "special"], 
                    [config.normal.weight, config.special.weight]
                );
            }

            randomTypeImg = `${config[randomType].label}-${Math.floor(Math.random()*config[randomType].lenImg)+1}`            

            Generator.generateElement(axis, randomTypeImg, config[randomType].label, rail);

            // Guarda el ID del timeout para posible cancelación
            if (axis === "Y") Generator.timeOutIdYp = timeoutId;
            if (axis === "-Y") Generator.timeOutIdYn = timeoutId;
            if (axis === "X") Generator.timeOutIdXp = timeoutId;
            if (axis === "-X") Generator.timeOutIdXn = timeoutId;
        }
        spawn();
    }

    
}