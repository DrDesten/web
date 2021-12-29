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