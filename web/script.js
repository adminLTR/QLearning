const state = {
    nx: 0,
    ny: 0,
    al: 0,
    tw: 0,
    py: 0,
    px: 0,
    epy: 0,
    epx: 0,
    eny: 0,
    enx: 0,
    dy: 0,
    dx: 0,
}


let trafficEnabledY = false;
let trafficEnabledX = true;

let isAmbar = false;

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

const carArrayImg = ["car", "sc"];
const carWeightsImg = [0.95, 0.05]

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
    const intervalLimits = !personArrayImg.includes(type) ? [0.31, 0.33, true] : [0.36, 0.38, false]
    
    carElement.classList.add("car");
    carElement.classList.add("car"+axis);
    carElement.classList.add("car"+axis+"-"+rail);
    carElement.src = "./img/"+img+".png";


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

            if ((posRatio >= intervalLimits[0] && posRatio <= intervalLimits[1]) ||
                (posRatio > siblingRatio - 0.05 && posRatio < siblingRatio)) {
                shouldPause = true;
            }
        }

        carElement.style.animationPlayState = shouldPause ? "paused" : "running";

        if (carElement.isConnected) requestAnimationFrame(monitorPosition);
    }

    const axisLower = axis.at(axis.length-1).toLowerCase();

    if (!intervalLimits[2]) { // is person        
        carElement.classList.add("person"+axis+"-"+rail);
        carElement.classList.add("person");
        document.getElementById("pedestrians"+axis+"-"+rail).append(carElement);
        state["p"+axisLower]++;
        if (type === "sp") {
            state["ep"+axisLower] = 1;
        }
    } else {        
        document.getElementById("container"+axis+"-"+rail).append(carElement);
        state["n"+axisLower]++;
        if (type === "sc") {
            state["en"+axisLower] = 1;
        }
    }
    
    carElement.addEventListener("animationend", () => {
        carElement.remove();
        if (!intervalLimits[2]) {
            state["p"+axisLower]--;
            if (type === "sp") {
                state["ep"+axisLower] = 0;
            }
        } else {
            state["n"+axisLower]--;
            if (type === "sc") {
                state["en"+axisLower] = 0;
            }
        }
    });
    requestAnimationFrame(monitorPosition);
}


document.addEventListener("click", () => {
    if (isAmbar) return;

    let newTrafficEnabledX = !trafficEnabledX;
    let newTrafficEnabledY = !trafficEnabledY;

    trafficEnabledX = false;
    trafficEnabledY = false;
    isAmbar = true;

    setTimeout(() => {
        trafficEnabledX = newTrafficEnabledX;
        trafficEnabledY = newTrafficEnabledY;
        isAmbar = false;
    }, 3000); 
});

function startTrafficFlow(axis, rail, people=false) {
    function spawn() {
        let randomDelay, timeoutId, randomType, randomTypeImg;
        if (people) {
            randomDelay = Math.random() * 15000 + 6000;
            timeoutId = setTimeout(spawn, randomDelay);
    
            randomType = weightedRandomChoice([...personArrayImg], [...personWeightsImg]);
            randomTypeImg = `${randomType}-${Math.floor(Math.random()*imgLen[randomType])+1}`            
        } else {
            randomDelay = Math.random() * 5000 + 2000;
            timeoutId = setTimeout(spawn, randomDelay);
    
            randomType = weightedRandomChoice([...carArrayImg], [...carWeightsImg]);
            randomTypeImg = `${randomType}-${Math.floor(Math.random()*imgLen[randomType])+1}`
        }

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

startTrafficFlow("Y", 1, true)
startTrafficFlow("Y", 2, true)
startTrafficFlow("-Y", 1, true)
startTrafficFlow("-Y", 2, true)
startTrafficFlow("X", 1, true)
startTrafficFlow("X", 2, true)
startTrafficFlow("-X", 1, true)
startTrafficFlow("-X", 2, true)