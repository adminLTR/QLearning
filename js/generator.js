class Generator {

    static timeOutIdXp = 0; static timeOutIdXn = 0;
    static timeOutIdYp = 0; static timeOutIdYn = 0;
    
    /**
     * @param {items : Array[string]} 
     * @param {weights : Array[Number]}
     * @return A random choice 
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
     * Generates a new car or pedestrian in street
     * @param {string} axis Describes the axis we are pointing to: X, -X, Y, -Y
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
    static startTrafficFlow(axis, rail, people=false) {
        function spawn() {
            let randomDelay, timeoutId, randomType, randomTypeImg;
            let config = people ? CONFIG.person : CONFIG.car;
    
            randomDelay = Math.random() * config.time.max + config.time.min;
            timeoutId = setTimeout(spawn, randomDelay);

            randomType = Generator.choice(
            ["normal", "special"], 
            [config.normal.weight, config.special.weight]
            );
            randomTypeImg = `${config[randomType].label}-${Math.floor(Math.random()*config[randomType].lenImg)+1}`            

            Generator.generateElement(axis, randomTypeImg, config[randomType].label, rail);

            if (axis === "Y") Generator.timeOutIdYp = timeoutId;
            if (axis === "-Y") Generator.timeOutIdYn = timeoutId;
            if (axis === "X") Generator.timeOutIdXp = timeoutId;
            if (axis === "-X") Generator.timeOutIdXn = timeoutId;
        }
        spawn();
    }
}