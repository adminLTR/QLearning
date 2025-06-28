let trafficEnabledY = false;
let trafficEnabledX = true;

let timeOutIdXp; //X
let timeOutIdXn; //-X
let timeOutIdYp; //Y
let timeOutIdYn; //-Y

const imgLen = {
    car: 5,
    person: 7,
    sc: 3,
    sp: 1,
}

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

const arrayImg = ["car", "sc"];
const weightsImg = [0.998, 0.002]

function weightedRandomChoice(items, weights) {
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


function generateCar(axis, img, type) {
    const carElement = document.createElement("img");
    carElement.classList.add("car");
    carElement.classList.add("car"+axis);
    carElement.classList.add("car"+axis+"-"+Math.floor(Math.random()*2+1));
    carElement.src = "./img/"+img+".png";

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
                (posRatio > siblingRatio - 0.05 && posRatio < siblingRatio)) {
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

        const randomType = weightedRandomChoice(arrayImg, weightsImg);

        generateCar(axis, `${randomType}-${Math.floor(Math.random()*imgLen[randomType])+1}`, randomType);

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