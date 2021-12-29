const goldenAngle = Math.PI * (3 - Math.sqrt(5));

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



    var html = html_code(glsl_array(array, `vogel_disk_${samples}`))
    output.innerHTML = html
}

function calculateSamples_dynamic(form, output_id) {
    if (parseInt(form.sample_input.value) <= 1000) {
        calculateSamples(form, output_id)
    }
}