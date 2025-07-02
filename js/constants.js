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
            "min" : 0.31,
            "max" : 0.33,
        },
        "time" : {
            "min" : 5000,
            "max" : 15000
        },
    },
    "car" : {
        "special" : {
            "label" : "sc",
            "weight" : 0.1,
            "lenImg" : 3,
        },
        "normal" : {
            "label" : "car",
            "weight" : 0.9,
            "lenImg" : 5,
        },
        "intervals" : {
            "min" : 0.36,
            "max" : 0.38,
        },
        "time" : {
            "min" : 1000,
            "max" : 5000
        },
    }
}