function convertToGLSL( object, varname ) {
    // Type deduction
    function type( object ) {
        // Primitive Dispatch
        if ( typeof object === "boolean" )
            return "bool"
        if ( typeof object === "number" )
            return "float"
        if ( typeof object === "bigint" )
            return "float"
        if ( typeof object !== "object" )
            throw `glslify: Type deduction failed. Unsupported primitive.`

        // Vectors
        if ( ( object.length === 4 || object.length === undefined ) &&
            typeof object[0] === "number" && typeof object[1] === "number" && typeof object[2] === "number" && typeof object[3] === "number" )
            return "vec4"
        if ( ( object.length === 3 || object.length === undefined ) &&
            typeof object[0] === "number" && typeof object[1] === "number" && typeof object[2] === "number" )
            return "vec3"
        if ( ( object.length === 2 || object.length === undefined ) &&
            typeof object[0] === "number" && typeof object[1] === "number" )
            return "vec2"

        // Primitive Arrays
        if ( object instanceof Float32Array || object instanceof Float64Array )
            return "float[]"
        if ( object instanceof Uint8Array || object instanceof Uint16Array || object instanceof Uint32Array )
            return "uint[]"
        if ( object instanceof Int8Array || object instanceof Int16Array || object instanceof Int32Array )
            return "uint[]"

        // Complex Arrays
        if ( object instanceof Array ) {
            const isuniform = object.every( x => typeof x === typeof object[0] )
            if ( !isuniform )
                throw `glslify: Type deduction failed. Array has mixed types.`
            return type( object[0] ) + "[]"
        }

        throw `glslify: Type deduction failed.`
    }

    // Variable Assignment
    function assign( type, value, { array = false } = {} ) {
        return `const ${type} ${varname}${array ? "[]" : ""} = ${value};`
    }

    // Conversion Functions
    function bool( boolean ) {
        return assign( "bool", boolean )
    }
    function float( number ) {
        return assign( "float", number )
    }
    function floatarray( array ) {
        return assign( "float", `float[](\n${[...array].map( x => `\t${x}` ).join( ",\n" )}\n)`, { array: true } )
    }
    function uintarray( array ) {
        return assign( "uint", `uint[](\n${[...array].map( x => `\t${x}` ).join( ",\n" )}\n)`, { array: true } )
    }
    function intarray( array ) {
        return assign( "int", `int[](\n${[...array].map( x => `\t${x}` ).join( ",\n" )}\n)`, { array: true } )
    }
    function array( array ) {
        // Verify type uniformity
        const isuniform = array.every( x => typeof x === typeof array[0] )
        if ( !isuniform )
            throw `glslify: Conversion Failed. Array has mixed types`

        return GLSL.arrayAssign( array, varname )
    }

    // Primitive Dispatch
    if ( typeof object === "boolean" )
        return bool( object )
    if ( typeof object === "number" )
        return float( object )
    if ( typeof object === "bigint" )
        return float( Number( object ) )
    if ( typeof object !== "object" )
        throw `glslify: Conversion Failed.`

    // Array Dispatch
    if ( object instanceof Float32Array || object instanceof Float64Array )
        return floatarray( object )
    if ( object instanceof Uint8Array || object instanceof Uint16Array || object instanceof Uint32Array )
        return uintarray( object )
    if ( object instanceof Int8Array || object instanceof Int16Array || object instanceof Int32Array )
        return intarray( object )
    if ( object instanceof Array )
        return array( object )

    throw `glslify: Conversion Failed.`
}

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