const goldenAngle = Math.PI * (3 - Math.sqrt(5));

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


function calculateSamples(form, output_id) {
    var output  = document.getElementById(output_id)
    var samples = parseInt(form.sample_input.value)

    var array = new Array(samples)

    var invSqrtSamples = 1 / Math.sqrt(samples);
    for (let i = 0; i < samples; i++) {
        var radius = Math.sqrt(i + 0.5) * invSqrtSamples
        var theta  = i * goldenAngle

        var coords = [
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

    if (form.polar_coordinates.checked) { // Convert to polar coordinates
        array = array.map((curr)=>{
            return [
                Math.sqrt((curr[0]*curr[0]) + (curr[1]*curr[1])),
                Math.atan2(curr[1], curr[0])
            ]
        })
    }

    var html = html_code(glsl_array(array, `vogel_disk_${samples}`))
    output.innerHTML = html

    chart.data.datasets[0].data = array.map(val => { return {x: val[0], y: val[1]} });
    chart.update();
}

function calculateSamples_dynamic(form, output_id) {
    if (parseInt(form.sample_input.value) <= 1000) {
        calculateSamples(form, output_id)
    }
}




