function glsl_variable_constructor(data) {
    if (typeof(data) == "number") {
        return `${data}`
    } else {
        switch (data.length) {
            case 1:
                return `${data[0]}`
            case 2:
                return `vec2(${data[0]}, ${data[1]})`
            case 3:
                return `vec3(${data[0]}, ${data[1]}, ${data[2]})`
            case 4:
                return `vec4(${data[0]}, ${data[1]}, ${data[2]}, ${data[3]})`
        
            default:
                throw `glslify: Variable Conversion Failed. Variable of dimension ${data.length} not supported`
        }
    }
}


function glsl_array(array, varname) {
    var type = "";
    if (typeof(array[0]) == "number") {
        type = "float"
    } else {
        switch (array[0].length) {
            case 1:
                type = "float"
                break
            case 2:
                type = "vec2"
                break
            case 3:
                type = "vec3"
                break
            case 4:
                type = "vec4"
                break
        
            default:
                throw `glslify: Array Conversion Failed. Vector of length ${array[0].length} not supported`
        }
    }

    var array_prefix = `const ${type} ${varname}[${array.length}] = ${type}[](\n`
    
    var finalstring = array_prefix;
    for (let i = 0; i < array.length; i++) {
        finalstring += "   "
        finalstring += glsl_variable_constructor(array[i])

        if (i != array.length - 1) {
            finalstring += ",\n"
        } else {
            finalstring += "\n"
        }
    }
    finalstring += ");"

    return finalstring
}




// GLSL Parsing /////////////////////////////////////////////////////////////////////////

const testString = 
`const vec2 vogel_disk_10[10] = vec2[](
    vec2(0.2572579017634409, -0.04163309750617664),
    vec2(-0.251930634467436, 0.21998316851378627),
    vec2(0.07736396637194182, -0.5397186179385906),
    vec2(0.39360838848238255, 0.4278674385507702),
    vec2(-0.62691478344435, -0.15847790195666747),
    vec2(0.6593967781001273, -0.43968127469309026),
    vec2(-0.17564857785490662, 0.7369512865973062),
    vec2(-0.36550608817101793, -0.8101859817811641),
    vec2(0.8996625491276813, 0.27463289328509016),
    vec2(-0.8672894999078633, 0.3302620869287361)
);`


function glsl_parse_vec2_array(str = "") { // Get the values out of a glsl array
    const vec2Values = /vec2\(([0-9\.-]+), *([0-9\.-]+)\)/g // Regex to extract values
    let values = [...str.matchAll(vec2Values)].map(e => [parseFloat(e[1]),parseFloat(e[2])]) // Extracts all values, converts them to float and then puts them in a 2d array
    return values
}
function multilang_parse_vec2_array(str = "") {  // Get the values out of a glsl/hlsl array
    const vec2Values = /(vec2|float2)\(([0-9\.-]+), *([0-9\.-]+)\)/g // Regex to extract values
    let values = [...str.matchAll(vec2Values)].map(e => [parseFloat(e[2]),parseFloat(e[3])]) // Extracts all values, converts them to float and then puts them in a 2d array
    return values
}