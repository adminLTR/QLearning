class Generator {
    
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
}