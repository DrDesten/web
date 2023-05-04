const GLSL = {
    type( data ) {
        if ( typeof ( data ) == "number" ) {
            return "float"
        }
        if ( data.length >= 1 && data.length <= 4 ) {
            return data.length == 1 ? "float" : `vec${data.length}`
        }
        throw `glslify: Type resolution failed. Unable to resolve {${data}}`
    },

    vector( data ) {
        if ( typeof ( data ) == "number" ) {
            return data.toPrecision( 10 ) // Single Precision Floats have no more than 9 significant digits
        }
        if ( data.length >= 1 && data.length <= 4 ) {
            return data.length == 1 ? data.toPrecision( 10 ) : `vec${data.length}(${data.join( ", " )})`
        }

        throw `glslify: Variable Conversion Failed. Variable of dimension ${data.length} not supported`
    },

    array( data ) {
        let type = GLSL.type( data[0] )
        let result = `${type}[](\n${data.map( vec => "\t" + GLSL.vector( vec ) ).join( ",\n" )}\n)`
        return result
    },

    arrayAssign( data, varname ) {
        let type = GLSL.type( data[0] )
        return `const ${type} ${varname}[${data.length}] = ${GLSL.array( data )};`
    },
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


function glsl_parse_vec2_array( str = "" ) { // Get the values out of a glsl array
    const vec2Values = /vec2\(([0-9\.-]+), *([0-9\.-]+)\)/g // Regex to extract values
    let values = [...str.matchAll( vec2Values )].map( e => [parseFloat( e[1] ), parseFloat( e[2] )] ) // Extracts all values, converts them to float and then puts them in a 2d array
    return values
}
function multilang_parse_vec2_array( str = "" ) {  // Get the values out of a glsl/hlsl array
    const vec2Values = /(vec2|float2)\(([0-9\.-]+), *([0-9\.-]+)\)/g // Regex to extract values
    let values = [...str.matchAll( vec2Values )].map( e => [parseFloat( e[2] ), parseFloat( e[3] )] ) // Extracts all values, converts them to float and then puts them in a 2d array
    return values
}