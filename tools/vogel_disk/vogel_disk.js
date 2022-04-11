const goldenAngle      = Math.PI * (3 - Math.sqrt(5))
const goldenAngleRcp   = 1.0 / goldenAngle
const goldenAngleRcpSq = goldenAngleRcp*goldenAngleRcp


// PREVIEW CHART //////////////////////////////////////////////////////////////////////////

const ctx = document.getElementById("preview_chart")

let data = {
    datasets: [{
        label: 'Sample Preview',
        data: [{x:0,y:0}],
        backgroundColor: 'rgb(255, 99, 132)'
    }],
};


let chartLineColor = "rgba(255,255,255,0.25)"
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
                max: 1.05,

                grid: {
                    color: chartLineColor,
                    borderColor: chartLineColor,
                    drawBorder: false,
                },
                display: false,
            },
            y: {
                type: 'linear',
                min: -1.05,
                max: 1.05,

                grid: {
                    color: chartLineColor,
                    borderColor: chartLineColor,
                    drawBorder: false,
                },
                display: false,
            },
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


function calculateSamples(form, output_id) {
    let   output  = document.getElementById(output_id)
    const samples = parseInt(form.sample_input.value)

    let array = new Array(samples)

    let invSqrtSamples = 1 / Math.sqrt(samples);
    for (let i = 0; i < samples; i++) {
        let radius = Math.sqrt(i + 0.5) * invSqrtSamples
        let theta  = i * goldenAngle

        let coords = [
            radius * Math.cos(theta),
            radius * Math.sin(theta)
        ]

        array[i] = coords
    }

    if  (form.center_output.checked) { // Center the array
        // Calculate center of mass
        let arraySum = array.reduce((prev, curr)=>{
            return [prev[0]+curr[0], prev[1]+curr[1]]
        }, [0,0])
        arraySum = [arraySum[0] / array.length, arraySum[1] / array.length];

        array = array.map((curr)=>{
            return [curr[0] - arraySum[0], curr[1] - arraySum[1]]
        })
    }

    /* chart.data.datasets[0].data = array.map(val => { return {x: 0, y: 0} });
    chart.update(); */
    chart.data.datasets[0].data = array.map(val => { return {x: val[0], y: val[1]} });
    chart.update();

    if (form.polar_coordinates.checked) { // Convert to polar coordinates
        array = array.map((curr)=>{
            return [
                Math.sqrt((curr[0]*curr[0]) + (curr[1]*curr[1])),
                Math.atan2(curr[1], curr[0])
            ]
        })
    }

    let html = glsl_array(array, `vogel_disk_${samples}`)

    if (form.auto_copy.checked) {
        navigator.clipboard.writeText(html);
    }

    output.innerHTML = html_code(html)
}

function calculateSamples_dynamic(form, output_id) {
    if (parseInt(form.sample_input.value) <= 1000) {
        calculateSamples(form, output_id)
    }
}




