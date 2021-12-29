function factorial(n) {
    if (n <= 1) {return 1}
    var fact = 1;
    for (let i = n; i >= 1; i-=1) {
        fact *= i;
    }
    return fact;
}

function pascalTriangle(length) {
    var output = [1]
    
    for (let i = 1; i < length; i++) {
        // ... = spread operator (puts all array elements inside)
        temp = [0, ...output, 0]
        // Increase length by 1
        output.push(0);
        
        // Add values together in pairs to get pascals triangle
        for (let o = 0; o < output.length; o++) {
            output[o] = temp[o] + temp[o+1]
        }
    }

    return output
}


function calculateSamples_dynamic(form, output_id, samples) {
    if (parseInt(samples) <= 250) {
        calculateSamples(form, output_id)
    }
}
function calculateSamples(form, output_id) {
    var output  = document.getElementById(output_id)
    var samples = parseInt(form.sample_input.value)
    if (isNaN(samples)) {return}

    var array   = pascalTriangle(samples)
    var sum     = array.reduce((prev, curr) => {return prev + curr}, 0) // Accumulate Array Sum

    array = array.map((curr) => {return curr / sum}) // Normalize Array

    var html = html_code(glsl_array(array, `gaussian_${samples}`))
    output.innerHTML = html;
}