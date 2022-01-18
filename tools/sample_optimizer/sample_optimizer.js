const goldenAngle      = Math.PI * (3 - Math.sqrt(5))
const goldenAngleRcp   = 1.0 / goldenAngle
const goldenAngleRcpSq = goldenAngleRcp*goldenAngleRcp

function convert2DtoChart(arr) {
    return arr.map(e => { return {x: e[0], y: e[1]} })
}


// PREVIEW CHART //////////////////////////////////////////////////////////////////////////

const ctx = document.getElementById("preview_chart")

let data = {
    datasets: [{
        label: 'Sample Preview',
        data: [{x:0,y:0}],
        backgroundColor: 'rgb(255, 99, 132)'
    }],
};

let config = {
    type: 'scatter',
    data: data,
    options: {
        plugins: {
            tooltip: {
                enabled: false
            },
            legend: {
                display: false,
            }
        },
        scales: {
            x: {
                type: 'linear',
                position: 'bottom',
                min: -1.05,
                max: 1.05
            },
            y: {
                type: 'linear',
                min: -1.05,
                max: 1.05
            }
        },
        elements: {
            point: {
                radius: 7.5,
            }
        }
    }
};

const chart = new Chart(ctx, config)



// ACTUAL CALCULATIONS //////////////////////////////////////////////////////////////////////////

function judgeProgressiveness1D(sample_arr) {
    squareDeviation = []

    for (let pass = 1; pass <= Math.log2(sample_arr.length); pass++) {

        let passLength = sample_arr.length / (2**pass)
        let sqDiv      = 0
        for (let i = 0; i < passLength; i++) {

            sample_arr[i] = (sample_arr[2*i] + sample_arr[2*i+1]) * 0.5
            sqDiv        += sample_arr[i] * sample_arr[i]

        }
        squareDeviation.push(sqDiv)

    }

    return squareDeviation.reduce((prev, curr)=>prev+curr) / squareDeviation.length
}

function judgeProgressiveness2D(sample_arr) {
    squareDeviation = []

    for (let pass = 1; pass <= Math.log2(sample_arr.length); pass++) {

        let passLength = sample_arr.length / (2**pass)
        let sqDiv      = [0,0]
        for (let i = 0; i < passLength; i++) {

            sample_arr[i] = [sample_arr[2*i][0] + sample_arr[2*i+1][0], sample_arr[2*i][1] + sample_arr[2*i+1][1]]
            sqDiv         = [sqDiv[0] + (sample_arr[i][0] * sample_arr[i][0]), sqDiv[1] + (sample_arr[i][1] * sample_arr[i][1])]

        }
        squareDeviation.push(sqDiv)

    }

    let averageError = squareDeviation.reduce((prev, curr)=> [prev[0]+curr[0],prev[1]+curr[1]], [0,0])
    return Math.sqrt((averageError[0]*averageError[0]) + (averageError[1]*averageError[1])) / squareDeviation.length
}







let arrayToOptimize = [];
function submitText(textarea) {
    input = document.getElementById(textarea).value
    arrayToOptimize = glsl_parse_array(input)

    //console.log(arrayToOptimize)
    //console.log(input)
    chart.data.datasets[0].data = convert2DtoChart(arrayToOptimize)
    chart.update()

    runOptimizer(arrayToOptimize)
}

function runOptimizer(array, steps = 10) {

    //console.log(array)
    let progressiveness = judgeProgressiveness2D(array)
    //console.log(array)
    let optimizedArray  = _.cloneDeep(array)
    //console.log(array)
    let tmp = [0,0]

    console.log(`Progressiveness: ${progressiveness}`)

    for (let i = 0; i < steps; i++) {
        let si1 = Math.round(Math.random() * array.length)
        let si2 = Math.round(Math.random() * array.length)

        tmp        = _.clone(array[si1])
        array[si1] = _.clone(array[si2])
        array[si2] = tmp

        let newProgressiveness = judgeProgressiveness2D(array)
        if (newProgressiveness < progressiveness) {

            progressiveness = newProgressiveness
            optimizedArray[si1] = array[si1]
            optimizedArray[si2] = array[si2]

        } else {

            array[si1] = optimizedArray[si1]
            array[si2] = optimizedArray[si2]

        }
    }

    console.log(`New Progressiveness: ${progressiveness}`)

    return optimizedArray
}
