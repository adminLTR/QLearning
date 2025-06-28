let trafficEnabledY = false;
let trafficEnabledX = true;

let timeOutIdXp; //X
let timeOutIdXn; //-X
let timeOutIdYp; //Y
let timeOutIdYn; //-Y

const translator = {
    "Y" : ["top", "Height"],
    "-Y" : ["bottom", "Height"],
    "X" : ["left", "Width"],
    "-X" : ["right", "Width"],
}

const counters = {
    "Y" : 0,
    "X" : 0,
}

function generateCar(axis = "Y") {
    const carElement = document.createElement("div");
    carElement.classList.add("car");
    carElement.classList.add("car"+axis);

    
    

    function monitorPosition() {
        const pos = translator[axis][0];
        const posValue = parseFloat(getComputedStyle(carElement)[pos]);
        const parentSize = carElement.parentElement["client" + translator[axis][1]];
        const posRatio = posValue / parentSize;

        // Condición para eje en rojo
        const isRed = (!trafficEnabledY && axis.includes("Y")) || (!trafficEnabledX && axis.includes("X"));

        let shouldPause = false;

        if (isRed) {
            let siblingRatio = -Infinity;
            if (carElement.previousSibling && carElement.previousSibling.classList.contains("car")) {
                const siblingValue = parseFloat(getComputedStyle(carElement.previousSibling)[pos]);
                siblingRatio = siblingValue / parentSize;
            }

            // Solo se detiene si está muy cerca de la línea peatonal (zona crítica)
            // o si está cerca del auto anterior (cola)
            if ((posRatio >= 0.32 && posRatio <= 0.34) ||
                (posRatio > siblingRatio - 0.025 && posRatio < siblingRatio)) {
                shouldPause = true;
            }
        }

        carElement.style.animationPlayState = shouldPause ? "paused" : "running";

        if (carElement.isConnected) requestAnimationFrame(monitorPosition);
    }

    document.getElementById("container"+axis).append(carElement);
    counters[axis[axis.length-1]]++;
    
    carElement.addEventListener("animationend", () => {
        carElement.remove();
        counters[axis[axis.length-1]]--;
    });
    requestAnimationFrame(monitorPosition);
}


document.addEventListener("click", () => {
    trafficEnabledX = !trafficEnabledX;
    trafficEnabledY = !trafficEnabledY;
});

function startTrafficFlow(axis) {
    function spawn() {
        const randomDelay = Math.random() * 2000 + 1000;
        const timeoutId = setTimeout(spawn, randomDelay);

        generateCar(axis);

        if (axis === "Y") timeOutIdYp = timeoutId; // guardar el timeout solo para eje Y
        if (axis === "-Y") timeOutIdYn = timeoutId; // guardar el timeout solo para eje Y
        if (axis === "X") timeOutIdXp = timeoutId; // guardar el timeout solo para eje Y
        if (axis === "-X") timeOutIdXn = timeoutId; // guardar el timeout solo para eje Y
    }
    spawn();
}

startTrafficFlow("Y")
startTrafficFlow("-Y")
startTrafficFlow("X")
startTrafficFlow("-X")