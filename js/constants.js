const TRANSLATOR = {
    "Y" : {
        "side" : "top",
        "client" : "clientHeight",
    },
    "-Y" : {
        "side" : "bottom",
        "client" : "clientHeight",
    },
    "X" : {
        "side" : "left",
        "client" : "clientWidth",
    },
    "-X" : {
        "side" : "right",
        "client" : "clientWidth",
    },
}

const CONFIG =  {
    "person" : {
        "special" : {
            "label" : "sp",
            "weight" : 0.005,
            "lenImg" : 1,
        },
        "normal" : {
            "label" : "person",
            "weight" : 0.995,
            "lenImg" : 7,
        },
        "intervals" : {
            "min" : 0.37,
            "max" : 0.39,
        },
        "time" : {
            "min" : 5000,
            "max" : 15000
        },
    },
    "car" : {
        "special" : {
            "label" : "sc",
            "weight" : 0.01,
            "lenImg" : 3,
        },
        "normal" : {
            "label" : "car",
            "weight" : 0.99,
            "lenImg" : 5,
        },
        "intervals" : {
            "min" : 0.30,
            "max" : 0.32,
        },
        "time" : {
            "min" : 1000,
            "max" : 5000
        },
    }
}

let trafficEnabledY = false;
let trafficEnabledX = true;

let isAmbar = false; 

let betterAction;
let stateString;

let generateSpecial = ''