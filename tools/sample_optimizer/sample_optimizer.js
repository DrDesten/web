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

function calcAverage(arr) { return arr.reduce((sum, curr) => sum + curr, 0) / arr.length }
function calcVariance(arr, average) { return arr.reduce((sum, curr) => sum + ((curr - average)*(curr - average)), 0) / arr.length }

function judgeProgressiveness1D(arr = []) {

    let averages = [], variances = []
    
    for (let arrLength = 2; arrLength < arr.length; arrLength++) {

        for (let position = 0; position < arr.length - arrLength; position++) {

            sliceToAnalyze = arr.slice(position, position + arrLength)
            let average = calcAverage(sliceToAnalyze)
            averages.push(average)
            variances.push(calcVariance(sliceToAnalyze, average))

        }

    }

    let progressiveness = calcVariance(averages, calcAverage(averages)) + calcVariance(variances, calcAverage(variances))
    progressiveness     = 1 / (progressiveness + 1);
    return progressiveness
}

function calcAverage2D(arr) { average = arr.reduce((sum, curr) => [sum[0]+curr[0],sum[1]+curr[1]], [0,0]); return [average[0]/arr.length, average[1]/arr.length] }
function calcVariance2D(arr, average) { variance = arr.reduce((sum, curr) => [sum[0]+((curr[0]-average[0])*(curr[0]-average[0])), sum[1]+((curr[1]-average[1])*(curr[1]-average[1]))], [0,0]); return [variance[0]/arr.length, variance[1]/arr.length] }

function judgeProgressiveness2D(arr = [[]]) {

    let averages = [], variances = []

    for (let arrLength = 2; arrLength <= arr.length; arrLength++) {

        for (let position = 0; position <= arr.length - arrLength; position++) {

            sliceToAnalyze = arr.slice(position, position + arrLength)
            average = calcAverage2D(sliceToAnalyze)
            averages.push(average)
            variances.push(calcVariance2D(sliceToAnalyze, average).reduce((sum, curr) => sum+curr, 0)) // Sum up both x and y variances

        }

    }

    //console.log(averages, variances)

    let progressiveness = calcVariance2D(averages, calcAverage2D(averages)).reduce((sum, curr) => sum+curr, 0) + calcVariance(variances, calcAverage(variances))
    progressiveness     = 1 / (progressiveness + 1);
    return progressiveness
}












function randInt(from = 0, to = 1) { // Returns a random Integer from from (including) to to (excluding)
    return Math.round(Math.random() * (to - from - 1)) + from
}

function improveProgressiveness1D(arr = [], steps = 1000) {

    let progressiveness
    for (let i = 0; i < steps; i++) {

        progressiveness = judgeProgressiveness1D(arr)

        let pos1 = randInt(0, arr.length)
        let pos2 = randInt(0, arr.length)
        
        let tmp = arr[pos1]
        arr[pos1] = arr[pos2]
        arr[pos2] = tmp

        let newProgressiveness = judgeProgressiveness1D(arr)

        // If the progressiveness improved, keep array and set the new progressiveness
        // If not, swap back
        if (newProgressiveness > progressiveness) {
            progressiveness = newProgressiveness
        } else {
            let tmp = arr[pos1]
            arr[pos1] = arr[pos2]
            arr[pos2] = tmp
        }

    }

    return arr

}

function improveProgressiveness2D(arr = [[]], steps = 100) {

    let progressiveness
    for (let i = 0; i < steps; i++) {

        progressiveness = judgeProgressiveness2D(arr)

        let pos1 = randInt(0, arr.length)
        let pos2 = randInt(0, arr.length)
        
        let tmp = arr[pos1]
        arr[pos1] = arr[pos2]
        arr[pos2] = tmp

        let newProgressiveness = judgeProgressiveness2D(arr)

        // If the progressiveness improved, keep array and set the new progressiveness
        // If not, swap back
        if (newProgressiveness > progressiveness) {
            progressiveness = newProgressiveness
        } else {
            let tmp = arr[pos1]
            arr[pos1] = arr[pos2]
            arr[pos2] = tmp
        }

    }

    console.log(progressiveness)

    return arr

}














function optimizeArray(str = "", steps = 100) {
    let values = glsl_parse_vec2_array(str)
    improveProgressiveness2D(values, steps)
    console.log(values)
}