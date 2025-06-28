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

const carArrayImg = ["car", "sc"];
const carWeightsImg = [0.998, 0.002]

const personArrayImg = ["person", "sp"];
const personWeightsImg = [0.95, 0.05]

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


function generateCar(axis, img, type, rail) {
    const carElement = document.createElement("img");
    carElement.classList.add("car");
    carElement.classList.add("car"+axis);
    carElement.classList.add("car"+axis+"-"+rail);
    carElement.src = "./img/"+img+".png";

    const intervalLimits = !personArrayImg.includes(type) ? [0.32, 0.34] : [0, 0]

    function monitorPosition() {
        const pos = translator[axis][0];
        const posValue = parseFloat(getComputedStyle(carElement)[pos]);
        const parentSize = carElement.parentElement["client" + translator[axis][1]];
        const posRatio = posValue / parentSize;

        const isRed = (!trafficEnabledY && axis.includes("Y")) || (!trafficEnabledX && axis.includes("X"));

        let shouldPause = false;

        if (isRed) {
            let siblingRatio = -Infinity;
            if (carElement.previousSibling && carElement.previousSibling.classList.contains("car")) {
                const siblingValue = parseFloat(getComputedStyle(carElement.previousSibling)[pos]);
                siblingRatio = siblingValue / parentSize;
            }

            if ((posRatio >= 0.32 && posRatio <= 0.34) ||
                (posRatio > siblingRatio - 0.05 && posRatio < siblingRatio)) {
                shouldPause = true;
            }
        }

        carElement.style.animationPlayState = shouldPause ? "paused" : "running";

        if (carElement.isConnected) requestAnimationFrame(monitorPosition);
    }

    document.getElementById("container"+axis+"-"+rail).append(carElement);
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

function startTrafficFlow(axis, rail) {
    function spawn() {
        const randomDelay = Math.random() * 3000 + 1000;
        const timeoutId = setTimeout(spawn, randomDelay);

        const randomType = weightedRandomChoice(carArrayImg, carWeightsImg);
        const randomTypeImg = `${randomType}-${Math.floor(Math.random()*imgLen[randomType])+1}`

        generateCar(axis, randomTypeImg, randomType, rail);

        if (axis === "Y") timeOutIdYp = timeoutId;
        if (axis === "-Y") timeOutIdYn = timeoutId;
        if (axis === "X") timeOutIdXp = timeoutId;
        if (axis === "-X") timeOutIdXn = timeoutId;
    }
    spawn();
}

startTrafficFlow("Y", 1)
startTrafficFlow("Y", 2)
startTrafficFlow("-Y", 1)
startTrafficFlow("-Y", 2)
startTrafficFlow("X", 1)
startTrafficFlow("X", 2)
startTrafficFlow("-X", 1)
startTrafficFlow("-X", 2)