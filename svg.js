class Vec2 {
    /**
     * @param {number|{x:number,y:number}|Vec2|[number,number]} vector - The x coordinate or an object or array with x and y coordinates.
     * @param {number} y - The y coordinate.
     */
    constructor( vector = 0 , y ) {
        /** @type {number} x coordinate */
        this.x
        /** @type {number} y coordinate */
        this.y

        if (typeof vector == "number")
            this.x = vector, 
            this.y = y ?? vector
        else 
            this.x = vector.x ?? vector[0], 
            this.y = vector.y ?? vector[1] ?? this.x
    }   

    /** @type {number} x coordinate */
    get "0"(){ return this.x }
    /** @type {number} y coordinate */
    get "1"(){ return this.y }
    /** @type {Vec2} */
    get xx() { return new Vec2( this.x, this.x ) }
    /** @type {Vec2} clones the vector */
    get xy() { return new Vec2( this.x, this.y ) }
    /** @type {Vec2} */
    get yy() { return new Vec2( this.y, this.y ) }
    /** @type {Vec2} */
    get yx() { return new Vec2( this.y, this.x ) }

    /**
     * Adds the specified vector to this Vec2 instance.
     * @param {number|Vec2} vector - A number or a Vec2 instance to add.
     * @returns {Vec2} A new Vec2 instance with the result of the addition.
     */
    add( vector ) {
        if ( typeof vector == "number" )
            return new Vec2( this.x + vector , this.y + vector ) 
        else
            return new Vec2( this.x + vector.x , this.y + vector.y ) 
    }

    /**
     * Subtracts the specified vector from this Vec2 instance.
     * @param {number|Vec2} vector - A number or a Vec2 instance to subtract.
     * @returns {Vec2} A new Vec2 instance with the result of the subtraction.
     */
    sub( vector ) { 
        if ( typeof vector == "number" )
            return new Vec2( this.x - vector , this.y - vector ) 
        else
            return new Vec2( this.x - vector.x , this.y - vector.y ) 
    }

    /**
     * Multiplies this Vec2 instance by the specified vector.
     * @param {number|Vec2} vector - A number or a Vec2 instance to multiply by.
     * @returns {Vec2} A new Vec2 instance with the result of the multiplication.
     */
    mul( vector ) { 
        if ( typeof vector == "number" )
            return new Vec2( this.x * vector , this.y * vector ) 
        else
            return new Vec2( this.x * vector.x , this.y * vector.y ) 
    }

    /**
     * Divides this Vec2 instance by the specified vector.
     * @param {number|Vec2} vector - A number or a Vec2 instance to divide by.
     * @returns {Vec2} A new Vec2 instance with the result of the division.
     */
    div( vector ) { 
        if ( typeof vector == "number" )
            return new Vec2( this.x / vector , this.y / vector ) 
        else
            return new Vec2( this.x / vector.x , this.y / vector.y ) 
    }


    /**
     * Calculates the length of this Vec2 instance.
     * @returns {number} The length of the Vec2 instance.
     */
    length() {
        return Math.sqrt( this.x * this.x + this.y * this.y )
    }

    /**
     * Calculates the squared length of this Vec2 instance.
     * @returns {number} The squared length of the Vec2 instance.
     */
    lengthSq() {
        return this.x * this.x + this.y * this.y
    }

    /**
     * Normalizes this Vec2 instance.
     * @returns {Vec2} A new Vec2 instance with the normalized vector.
     */
    normalize() {
        const invlength = 1 / Math.sqrt( this.x * this.x + this.y * this.y )
        return new Vec2( this.x * invlength , this.y * invlength ) 
    }

    /**
     * Sets the length of this Vec2 instance.
     * @param   {number} length The new length of the vector
     * @returns {number} A new Vec2 instance with the specified length.
     */
    setLength( length ) {
        const scale = length / Math.sqrt( this.x * this.x + this.y * this.y )
        return new Vec2( this.x * scale , this.y * scale ) 
    }

    // STATIC ///////////////////////////////////////////////////////

    /**
     * Calculates the dot product of two Vec2 instances.
     * @param {Vec2} v1 - The first Vec2 instance.
     * @param {Vec2} v2 - The second Vec2 instance.
     * @returns {number} The dot product of the two Vec2 instances.
     */
    static dot( v1, v2 ) {
        return v1.x * v2.x + v1.y * v2.y
    }

    /**
     * Calculates the distance between two Vec2 instances.
     * @param {Vec2} v1 - The first Vec2 instance.
     * @param {Vec2} v2 - The second Vec2 instance.
     * @returns {number} The distance between the two Vec2 instances.
     */
    static distance( v1, v2 ) {
        const diffX = v1.x - v2.x
        const diffY = v1.y - v2.y
        return Math.sqrt( diffX * diffX + diffY * diffY )
    }

    /**
     * Calculates the squared distance between two Vec2 instances.
     * @param {Vec2} v1 - The first Vec2 instance.
     * @param {Vec2} v2 - The second Vec2 instance.
     * @returns {number} The squared distance between the two Vec2 instances.
     */
    static distanceSq( v1, v2 ) {
        const diffX = v1.x - v2.x
        const diffY = v1.y - v2.y
        return diffX * diffX + diffY * diffY
    }

    /**
     * Creates a vector from a start point to an end point.
     * @param {Vec2} startPoint - The start point.
     * @returns {{to: (endPoint: Vec2) => Vec2}}
     */
    static from( startPoint ) {
        return { to( endPoint ) {
            return new Vec2(endPoint).sub(startPoint)
        }}
    }
    /**
     * Creates a vector from an end point to a start point.
     * @param {Vec2} endPoint - The end point.
     * @returns {{from: (startPoint: Vec2) => Vec2}}
     */
    static to( endPoint ) {
        return { from( startPoint ) {
                return new Vec2(endPoint).sub(startPoint)
        }}
    }

}

class SVGTemplate {
    /** @param {string} type */
    constructor(type) {
        this.ele = document.createElementNS("http://www.w3.org/2000/svg", type)

        /** @type {Object.<string,string>} */
        this.attributes = {}
        /** @type {Object.<string,(string|number)[]>} */
        this.transformAttributes = {}
    }
    /** @param {string} attribute @param {string} value */
    set(attribute, value) { return this.ele.setAttribute(attribute, value), this.attributes[attribute] = value, this }

    /** @param {Object.<string,string>} defaults @param {Object.<string,string>} override */
    setDefaults(defaults, override) {
        const attributes = Object.assign(defaults, override)
        for (const attribute in attributes) this.set(attribute, attributes[attribute])
    }

    // Animation ///////////////////////////////////////////////

    /** @param {number} millisecondsSinceInitialisation */
    update(millisecondsSinceInitialisation = Infinity) {
        if (this.updateCallback != undefined) this.updateCallback.call(this, this, millisecondsSinceInitialisation)
        return this
    }

    /** @param {(SVGObject: this, millisecondsSinceInitialisation: number)=>void} updateFunction */
    onUpdate(updateFunction) { return this.updateCallback = updateFunction, this }

    // Style //////////////////////////////////////////////////

    /** @param {string} cssColor */
    fill(cssColor) { return this.set("fill", cssColor), this }
    /** @param {string} cssColor */
    color(cssColor) { return this.set("stroke", cssColor), this }

    /** @param {number} width */
    width(width) { return this.set("stroke-width", width), this }
    /** @param {string} linecap */
    linecap(linecap) { return this.set("stroke-linecap", linecap), this }

    /** @param {number} opacity */
    opacity(opacity) { return this.set("opacity", opacity), this }

    applyTransforms() {
        let transformProperty = ""
        for (const transform in this.transformAttributes) {
            transformProperty += ` ${transform}(${this.transformAttributes[transform].join(",")}) `
        }
        this.set("transform", transformProperty)
        return this
    }

    scale(x, y) {
        this.transformAttributes.scale = [x, y ?? x]
        this.applyTransforms()
        return this
    }

    rotate(angle) {
        this.transformAttributes.rotate = [angle]
        return this.applyTransforms()
    }

    ///////////////////////////////////////////////////////////////////
    // Static
    ///////////////////////////////////////////////////////////////////

    // Coordinate Maniputaion ///////////////////////////////

    /** 
     * Returns a point on a circle given an angle, radius and center  
     * @param {number} angle 
     * @param {number} radius 
     * @param {[number,number]|{x:number,y:number}} center 
     **/
    static circlePoint(angle, radius = 1, center = [0, 0]) {
        return {
            x: Math.sin(angle) * radius + center[0] ?? center.x,
            y: Math.cos(angle) * radius + center[1] ?? center.y,
            asArray() { return [this.x, this.y] }
        }
    }

    // Curves ////////////////////////////////////////////////

    static get cubicBezier() {
        return {

            /**
             * Calculates the control point for a cubic Bezier curve.
             * @param {Vec2} lastlast The previous point before the last point.
             * @param {Vec2} last The last point.
             * @param {Vec2} current The current point.
             * @param {number=} guideDistance The distance that the control point should be from the last point. If not specified, the distance is calculated from the last and current points.
             * @returns {{point: Vec2, guideVector: Vec2}} An object containing the calculated control point and the guide vector used to calculate it.
            */
            controlPoint1(lastlast, last, current, guideDistance) {
                guideDistance    ??= Vec2.distance(last, current)
                const guideVector  = Vec2.setLength(Vec2.from(lastlast).to(current), guideDistance / 3)
                const controlPoint = Vec2.add(last, guideVector)
                return {
                    point: controlPoint,
                    guideVector: guideVector
                }
            },

            /**
             * Calculates the control point for a cubic Bezier curve.
             * @param {Vec2} last The last point.
             * @param {Vec2} current The current point.
             * @param {Vec2} next The next point.
             * @param {number=} guideDistance The distance that the control point should be from the last point. If not specified, the distance is calculated from the last and current points.
             * @returns {{point: Vec2, guideVector: Vec2}} An object containing the calculated control point and the guide vector used to calculate it.
            */
            controlPoint2(last, current, next, guideDistance) {
                guideDistance    ??= Vec2.distance(last, current)
                const guideVector  = Vec2.setLength(Vec2.from(next).to(last), guideDistance / 3)
                const controlPoint = Vec2.add(current, guideVector)
                return {
                    point: controlPoint,
                    guideVector: guideVector
                }
            },

            /**
             * Calculates the control points for a cubic Bezier curve.
             * @param {Vec2=} lastlast The previous point before the last point.
             * @param {Vec2}  last The last point.
             * @param {Vec2}  current The current point.
             * @param {Vec2=} next The next point.
             * @param {number=} guideDistance The distance that the control point should be from the last point. If not specified, the distance is calculated from the last and current points.
             * @returns {[
             *      {point: Vec2, guideVector: Vec2},
             *      {point: Vec2, guideVector: Vec2}
             * ]} An array containing the two calculated control points and their corresponding guide vectors.
            */
            controlPoints(lastlast, last, current, next, guideDistance) {
                if (!last || !current)  throw new Error("SVGTemplate.cubicBezier.controlPoints(): 'last' or 'current' are undefined. Both are required to calculate control points")
                if (!lastlast && !next) throw new Error("SVGTemplate.cubicBezier.controlPoints(): 'lastlast' and 'next' are undefined. At least one is required to calculate control points")

                guideDistance ??= Vec2.distance(last, current)

                if (lastlast && next) { // Both are defined, simply calculate control points
                    return [
                        this.controlPoint1(lastlast, last, current, guideDistance),
                        this.controlPoint2(last, current, next, guideDistance),
                    ]
                }

                if (next) { // 'lastlast' is not defined
                    const cp2 = this.controlPoint2(last, current, next, guideDistance)
                    const cp1 = {
                        point: cp2.guideVector.mul(1.5).add(current).sub(last).div(3).add(last),
                        guideVector: undefined
                    }
                    return [cp1, cp2]
                }

                if (lastlast) { // 'next' is not defined
                    const cp1 = this.controlPoint1(lastlast, last, current, guideDistance)
                    const cp2 = {
                        point: cp1.guideVector.mul(1.5).add(last).sub(current).div(3).add(current),
                        guideVector: undefined
                    }
                    return [cp1, cp2]
                }

                throw new Error("SVGTeplate.cubicBezier.controlPoints(): What the actual fuck?")

            },

        }
    }


    // Defaults //////////////////////////////////////////////

    /** @returns {Object.<string,string>} */
    static get lineDefaults() {
        return {
            "fill": "none",
            "stroke-width": "10",
            "stroke": "black",
            "stroke-linecap": "round",
        }
    }

    /** @returns {Object.<string,string>} */
    static get fillDefaults() {
        return {
            "fill": "black",
            "stroke-width": "10",
            "stroke": "none",
            "stroke-linecap": "round",
        }
    }
}

class SVGArc extends SVGTemplate {
    /** @param {Object.<string,string>} opts */
    constructor(opts = {}) {
        super("path")
        this.setDefaults(SVGTemplate.lineDefaults, opts)

        /** @private */
        this.centerPosition = [0, 0]
        /** @private */
        this.startAngle = 0
        /** @private */
        this.endAngle = 0
        /** @private */
        this.circularRadius = 0
    }

    /** 
     * Sets the center position of the arc.
     * @param {number} x - The x coordinate of the center.
     * @param {number=} y - The y coordinate of the center. If not provided, the x coordinate is used for both x and y.
     */
    center(x, y) {
        this.centerPosition = [x, y ?? x]
        return this
    }

    /** 
     * Sets the start and end angles of the arc.
     * @param {number} startAngle - The starting angle of the arc, in radians.
     * @param {number} endAngle - The ending angle of the arc, in radians.
     */
    angles(startAngle, endAngle) {
        this.startAngle = startAngle
        this.endAngle = endAngle
        return this
    }

    /** 
     * Sets the start and end angles of the arc, given as values between 0 and 1.
     * @param {number} startAngle - The starting angle of the arc, as a value between 0 and 1.
     * @param {number} endAngle - The ending angle of the arc, as a value between 0 and 1.
     */
    anglesNormalized(startAngle, endAngle) {
        this.startAngle = startAngle * Math.PI * 2
        this.endAngle = endAngle * Math.PI * 2
        return this
    }

    /** 
     * Sets the radius of the circular arc.
     * @param {number} radius - The radius of the circular arc.
     */
    radius(radius) {
        this.circularRadius = radius
        return this
    }

    /** 
     * Updates the arc to reflect any changes to its properties.
     * @param {number} millisecondsSinceInitialisation - The number of milliseconds since the object was initialized. 
     */
    update(millisecondsSinceInitialisation = Infinity) {
        // If an update callback function has been set, call it.
        if (this.updateCallback != undefined) this.updateCallback.call(this, this, millisecondsSinceInitialisation)

        // Store the start and end angles in an object.
        const angles = { start: this.startAngle, end: this.endAngle }
        // Store the circular radius in a variable.
        const radius = this.circularRadius

        // Calculate the start and end positions using basic trigonometry.
        let startPos = SVGTemplate.circlePoint(this.startAngle, this.circularRadius, this.centerPosition)
        let endPos = SVGTemplate.circlePoint(this.endAngle, this.circularRadius, this.centerPosition)
        // Prevent flicker when the start and end positions are almost the same.
        if (Math.abs(startPos.x - endPos.x) < 0.0001) startPos.x += 0.0001
        if (Math.abs(startPos.y - endPos.y) < 0.0001) startPos.y += 0.0001

        // Calculate the angular length of the arc.
        let angularLength = (angles.end - angles.start) / (Math.PI * 2) % 1

        // Initialize the "path" string that will be used to define the SVG path element.
        let path = ""
        // Set the rotation of the arc.
        path += `M ${startPos.x} ${startPos.y} `
        // Define the start of the arc.
        path += `A ${radius} ${radius} `
        // Set the ellipse rotation to 0.
        path += `0 `
        // Set the angle flag to true (1) if the angular length is larger than 180 degrees.
        path += `${+((angularLength > -0.5 && angularLength < 0) || (angularLength > 0.5 && angularLength < 1))} `
        // Set the sweep flag to 0.
        path += `0 `
        // Set the end position of the arc.
        path += `${endPos.x} ${endPos.y}`

        // Set the "d" attribute of the SVG path element to the "path" string.
        this.set("d", path)
        return this
    }

}

class SVGPath extends SVGTemplate {
    /** @param {Object.<string,string>} opts */
    constructor(opts = {}) {
        super("path")
        this.setDefaults(SVGTemplate.lineDefaults, opts)

        /** @private @type {'line'|'cubic bezier'|'quadratic bezier'|'custom'} */
        this.pathMode = "line"
        /** @private @type {{type: 'line'|'cubic bezier'|'quadratic bezier'|'close'|'custom', x: number, y:number, custom?:string}[]} */
        this.pathPoints = []
        /** @private @type {boolean} */
        this.closed = false
    }

    /**
     * Sets the path mode, which determines how subsequent points in the path will be connected.
     * @param {'line'|'bezier'|'cubic bezier'|'quadratic bezier'|'custom'} mode - The path mode to set.
     */
    mode(mode) {
        return this.pathMode = {
            "L": "line",
            "line": "line",

            "C": "cubic bezier",
            "S": "cubic bezier",
            "bezier": "cubic bezier",
            "cubic bezier": "cubic bezier",

            "Q": "quadratic bezier",
            "T": "quadratic bezier",
            "quadratic bezier": "quadratic bezier",

            "custom": "custom",
        }[mode], this
    }

    /** 
     * Adds a point to the path.
     * @param {number|string} x - The x coordinate of the point, or a custom string when mode has been set to "custom"
     * @param {number=} y - The y coordinate of the point. If not provided, the x coordinate is used for both x and y.
     */
    point(x, y) {
        this.pathPoints.push(
            this.pathMode == "custom" ?
                { type: this.pathMode, x: NaN, y: NaN, custom: x } :
                { type: this.pathMode, x: x, y: y ?? x }
        )
        return this
    }

    /**
     * Closes the path.
     */
    close() {
        this.pathPoints.push({ type: "close", x: this.pathPoints[0]?.x, y: this.pathPoints[0]?.y })
        this.closed = true
        return this
    }

    // Animation ///////////////////////////////////////////////

    /** 
     * Updates the path.
     * @param {number} millisecondsSinceInitialisation - The number of milliseconds that have elapsed since the path was initialized.
     */
    update(millisecondsSinceInitialisation = Infinity) {
        if (this.updateCallback != undefined) this.updateCallback.call(this, this, millisecondsSinceInitialisation)

        let path = ""
        for (const [i, point] of this.pathPoints.entries()) {

            if (i == 0) {
                path += `M ${point.x} ${point.y} `
                continue
            }

            if (point.type == "close") {
                const lastPoint = this.pathPoints[i - 1]
                if (lastPoint.type != "cubic bezier") {
                    path += "Z "
                } else {
                    const points = {
                        // Set next point to be the first to close the path smoothly
                        "-2": this.pathPoints[i - 2], // Undefined only when Path is a single point
                        "-1": this.pathPoints[i - 1], // Always available
                        "0": this.pathPoints[0],   // Always available
                        "1": this.pathPoints[1],   // Always available
                    }
                    const controlPoints = SVGTemplate.cubicBezier.controlPoints(points[-2], points[-1], points[0], points[1])
                    path += `C ${controlPoints[0].point.x} ${controlPoints[0].point.y} ${controlPoints[1].point.x} ${controlPoints[1].point.y} ${point.x} ${point.y} Z `
                }
                break
            }

            switch (point.type) {
                case "line":
                    path += `L ${point.x} ${point.y} `
                    break
                case "cubic bezier":
                    const points = {
                        // If the path is closed and this is the first curve, use last point as previous to first
                        // last point is at index '-2' since the 'close' tag is in the last place
                        "-2": this.closed && i == 1 ? this.pathPoints[this.pathPoints.length - 2] : this.pathPoints[i - 2], // May be undefined 
                        "-1": this.pathPoints[i - 1], // Always available
                        "0": this.pathPoints[i],   // Always available
                        "1": this.pathPoints[i + 1], // May be undefined
                    }

                    // Only two available points, draw a line
                    if (!(points[-2] || points[1])) {
                        path += `L ${point.x} ${point.y} `
                        break
                    }

                    const controlPoints = SVGTemplate.cubicBezier.controlPoints(points[-2], points[-1], points[0], points[1])

                    path += `C ${controlPoints[0].point.x} ${controlPoints[0].point.y} `
                        + `${controlPoints[1].point.x} ${controlPoints[1].point.y} `
                        + `${point.x} ${point.y} `
                    break
                case "quadratic bezier":
                    path += `T ${point.x} ${point.y} `
                    break
                case "custom":
                    path += ` ${point.custom} `
                    break
                default:
                    throw new Error(`SVGPath.update(): Unexpected Point Type '${point.type}'`)
            }

        }

        this.set("d", path)
        return this
    }
}


class SVGLine extends SVGTemplate {
    /** @param {Object.<string,string>} opts */
    constructor(opts = {}) {
        super("line")
        this.setDefaults(SVGTemplate.lineDefaults, opts)

        /** @private */
        this.coordinateMode = "point"
        /** @private */
        this.angleMode = {
            center: [0, 0],
            angle: 0,
            startRadius: 0,
            endRadius: 0,
        }
        /** @private */
        this.pointMode = {
            start: [0, 0],
            end: [0, 0],
        }
    }

    /** @param {"point"|"angle"} coordinateMode */
    mode(coordinateMode) { return this.coordinateMode = coordinateMode, this }

    /** @param {number} x @param {number=} y */
    start(x, y) { return this.pointMode.start = [x, y ?? x], this.set("x1", x).set("y1", y) }
    /** @param {number} x @param {number=} y */
    end(x, y) { return this.pointMode.end = [x, y ?? x], this.set("x2", x).set("y2", y) }

    /** @param {number} x @param {number=} y */
    center(x, y) { return this.angleMode.center = [x, y ?? x], this }
    /** @param {number} a */
    angle(a) { return this.angleMode.angle = a, this }
    /** @param {number} a */
    angleNormalized(a) { return this.angleMode.angle = a * Math.PI * 2, this }
    /** @param {number} r */
    startRadius(r) { return this.angleMode.startRadius = r, this }
    /** @param {number} r */
    endRadius(r) { return this.angleMode.endRadius = r, this }
    /** @param {number} startRadius @param {number} endRadius */
    radii(startRadius, endRadius) { return this.startRadius(startRadius).endRadius(endRadius) }

    // Animation //////////////////////////////////////////

    /** @param {number} millisecondsSinceInitialisation */
    update(millisecondsSinceInitialisation = Infinity) {
        if (this.updateCallback != undefined) this.updateCallback.call(this, this, millisecondsSinceInitialisation)
        if (this.coordinateMode == "point")
            return this.set("x1", this.pointMode.start[0]).set("y1", this.pointMode.start[1])
                .set("x2", this.pointMode.end[0]).set("y2", this.pointMode.end[1])

        if (this.coordinateMode == "angle") {

            const startPos = SVGTemplate.circlePoint(this.angleMode.angle, this.angleMode.startRadius, this.angleMode.center)
            const endPos = SVGTemplate.circlePoint(this.angleMode.angle, this.angleMode.endRadius, this.angleMode.center)

            return this.set("x1", startPos.x).set("y1", startPos.y)
                .set("x2", endPos.x).set("y2", endPos.y)
        }

        throw new Error(`Positioning mode '${this.coordinateMode}' not recognized. Available modes are: 'point', 'angle'`)
    }

}

class SVGCircle extends SVGTemplate {
    /** @param {Object.<string,string>} opts */
    constructor(opts = {}) {
        super("circle")
        this.setDefaults(SVGTemplate.fillDefaults, opts)

        /** @private */
        this.centerPosition = [0, 0]
        /** @private */
        this.circularRadius = 0
    }

    /** 
     * Sets the center position of the circle.
     * @param {number} x - The x coordinate of the center.
     * @param {number=} y - The y coordinate of the center. If not provided, the x coordinate is used for both x and y.
     */
    center(x, y) { return this.centerPosition = [x, y ?? x], this }
    /** 
     * Sets the radius of the circle.
     * @param {number} r - The radius of the circle.
     */
    radius(r) { return this.circularRadius = r, this }

    /** 
     * Updates the circle to reflect any changes to its properties.
     * @param {number} millisecondsSinceInitialisation - The number of milliseconds since the object was initialized. 
     */
    update(millisecondsSinceInitialisation = Infinity) {
        // If an update callback function has been set, call it.
        if (this.updateCallback != undefined) this.updateCallback.call(this, this, millisecondsSinceInitialisation)

        // Update the SVG circle element to reflect the current center and radius values.
        this.set("cx", this.centerPosition[0]).set("cy", this.centerPosition[1]).set("r", this.circularRadius)
        return this
    }
}

class SVGEllipse extends SVGTemplate {
    /** @param {Object.<string,string>} opts */
    constructor(opts = {}) {
        super("ellipse")
        this.setDefaults(SVGTemplate.fillDefaults, opts)

        /** @private */
        this.centerPosition = [0, 0]
        /** @private */
        this.ellipseRadii = [0, 0]
    }

    /** 
     * Sets the center position of the circle.
     * @param {number} x - The x coordinate of the center.
     * @param {number=} y - The y coordinate of the center. If not provided, the x coordinate is used for both x and y.
     */
    center(x, y) { return this.centerPosition = [x, y ?? x], this }
    /** 
     * Sets the radius of the circle.
     * @param {number} rx - The x-radius of the ellipse.
     * @param {number=} ry - The y-radius of the ellipse. If not provided, the x-radius is used for both x and y.
     */
    radius(rx, ry) { return this.ellipseRadii = [rx, ry ?? rx], this }

    /** 
     * Updates the circle to reflect any changes to its properties.
     * @param {number} millisecondsSinceInitialisation - The number of milliseconds since the object was initialized. 
     */
    update(millisecondsSinceInitialisation = Infinity) {
        // If an update callback function has been set, call it.
        if (this.updateCallback != undefined) this.updateCallback.call(this, this, millisecondsSinceInitialisation)

        // Update the SVG ellipse element to reflect the current center and radius values.
        this.set("cx", this.centerPosition[0])
            .set("cy", this.centerPosition[1])
            .set("rx", this.ellipseRadii[0])
            .set("ry", this.ellipseRadii[1])
        return this
    }
}

class SVGRectangle extends SVGTemplate {
    /** @param {Object.<string,string>} opts */
    constructor(opts = {}) {
        super("rect")
        this.setDefaults(SVGTemplate.fillDefaults, opts)

        /** @private */
        this.coordinateMode = "corner"
        /** @private */
        this.rectangleDimensions = [0, 0]
        /** @private */
        this.rectanglePosition = [0, 0]
        /** @private */
        this.borderRadii = [0, 0]
    }

    /**
     * Sets the coordinate mode for the rectangle.
     * @param {"center"|"corner"} coordinateMode - The coordinate mode to use. Possible values are "center" and "corner".
     */
    mode(coordinateMode) { return this.coordinateMode = coordinateMode, this }

    /**
     * Sets the dimensions of the rectangle.
     * @param {number} width - The width of the rectangle.
     * @param {number=} height - The height of the rectangle. If not provided, the width is used for both width and height.
     */
    dimensions(width, height) { return this.rectangleDimensions = [width, height ?? width], this }

    /**
     * Sets the position of the rectangle.
     * @param {number} x - The x coordinate of the rectangle.
     * @param {number=} y - The y coordinate of the rectangle. If not provided, the x coordinate is used for both x and y.
     */
    position(x, y) { return this.rectanglePosition = [x, y ?? x], this }

    /**
     * Sets the border radii of the rectangle.
     * @param {number} rx - The x coordinate of the border radius.
     * @param {number=} ry - The y coordinate of the border radius. If not provided, the x coordinate is used for both x and y.
     */
    radius(rx, ry) { return this.borderRadii = [rx, ry ?? rx], this }

    /** 
     * Updates the rectangle to reflect any changes to its properties.
     * @param {number} millisecondsSinceInitialisation - The number of milliseconds since the object was initialized. 
     */
    update(millisecondsSinceInitialisation = Infinity) {
        // If an update callback function has been set, call it.
        if (this.updateCallback != undefined) this.updateCallback.call(this, this, millisecondsSinceInitialisation)

        if (this.coordinateMode == "center") {

            // If the coordinate mode is "center", calculate the rectangle position based on its dimensions and the center position.
            const [width, height] = this.rectangleDimensions
            const [x, y] = this.rectanglePosition
            this.set("x", x - width / 2)
                .set("y", y - height / 2)
                .set("width", width)
                .set("height", height)
                .set("rx", this.borderRadii[0])
                .set("ry", this.borderRadii[1])

        } else if (this.coordinateMode == "corner") {

            // If the coordinate mode is "corner", use the rectangle dimensions and position as-is.
            const [width, height] = this.rectangleDimensions
            const [x, y] = this.rectanglePosition
            this.set("x", x)
                .set("y", y)
                .set("width", width)
                .set("height", height)
                .set("rx", this.borderRadii[0])
                .set("ry", this.borderRadii[1])

        } else {
            // If the coordinate mode is not recognized, throw an error.
            throw new Error(`Positioning mode '${this.coordinateMode}' not recognized. Available modes are: 'center', 'corner'`)
        }

        return this
    }
}

class SVGGlobal {
    /**
     * Returns a new SVG element, bound to a parent element specified by a query selector.
     * The SVG element will take up the entire size of the parent element, with its elements positioned relatively within a [0, 100] range.
     * @param {string} parentQuerySelector - The query selector used to find the parent element for the SVG image.
     */
    constructor( parentQuerySelector, fitMode = "stretch" ) {

        this.parent = document.querySelector(parentQuerySelector)
        if (this.parent == null) {
            throw new Error(`SVG(): Unable to bind parent. Query selector '${parentQuerySelector}' does not match a DOM element.`)
        }

        this.svg = document.createElementNS("http://www.w3.org/2000/svg", "svg")

        switch (fitMode) {
            case undefined:
            case "stretch":
                this.parentAttachStretch()
                break
            case "cover":
                this.parentAttachCover()
                break
            case "fit":
                this.parentAttachFit()
                break
            case "fixed":
                this.parentAttachFixed()
                break
        }

        // Add the SVG element to the parent element.
        this.parent.appendChild( this.svg )
    }

    parentAttachStretch( initalSize = 100 ) {
        // Set Attributes to have the target width and height
        this.svg.setAttribute("style", `width: 100px; height: 100px`)

        // Reset old resizeObserver, create new one
        this.resizeObserver?.disconnect()
        this.resizeObserver = new ResizeObserver(entries => {

            // Get the size of the parent element.
            const parent = entries[0]
            const size   = { x: parent.target.clientWidth, y: parent.target.clientHeight }

            // Scale the SVG element according to the parent size.
            this.svg.style.transform = 
                `translate(${(size.x - initalSize) / 2}px,${(size.y - initalSize) / 2}px)` +
                `scale(${size.x / initalSize},-${size.y / initalSize})`
            
        })
        this.resizeObserver.observe(this.parent)
    }
    parentAttachCover( initalSize = 100 ) {
        // Set Attributes to have the target width and height
        this.svg.setAttribute("style", `width: 100px; height: 100px;`)
        this.parent.style.overflow = "hidden"

        // Reset old resizeObserver, create new one
        this.resizeObserver?.disconnect()
        this.resizeObserver = new ResizeObserver(entries => {

            // Get the size of the parent element.
            const parent = entries[0]
            const size   = { x: parent.target.clientWidth, y: parent.target.clientHeight }
            const max    = Math.max( size.x, size.y )

            // Scale the SVG element according to the parent size.
            this.svg.style.transform = 
                `translate(${(size.x - initalSize) / 2}px,${(size.y - initalSize) / 2}px)` +
                `scale(${max / initalSize},-${max / initalSize})`
            
        })
        this.resizeObserver.observe(this.parent)
    }
    parentAttachFit( initalSize = 100 ) {
        // Set Attributes to have the target width and height
        this.svg.setAttribute("style", `width: 100px; height: 100px;`)

        // Reset old resizeObserver, create new one
        this.resizeObserver?.disconnect()
        this.resizeObserver = new ResizeObserver(entries => {

            // Get the size of the parent element.
            const parent = entries[0]
            const size   = { x: parent.target.clientWidth, y: parent.target.clientHeight }
            const min    = Math.min( size.x, size.y )

            // Scale the SVG element according to the parent size.
            this.svg.style.transform = 
                `translate(${(size.x - initalSize) / 2}px,${(size.y - initalSize) / 2}px)` +
                `scale(${min / initalSize},-${min / initalSize})`
            
        })
        this.resizeObserver.observe(this.parent)
    }
    parentAttachFixed( initalSize = 100 ) {
        // Set Attributes to have the target width and height
        this.svg.setAttribute("style", `width: 100px; height: 100px;`)
        // Reset old resizeObserver
        this.resizeObserver?.disconnect()
    }

    /** 
     * Adds new children to the SVG element.
     * @param {SVGTemplate[]} SVGElements - The elements to be added as children of the SVG image.
     */
    add(...SVGElements) {
        for (const ele of SVGElements)
            this.svg.appendChild(ele.ele)
        return this
    }
}



const SVG = Object.assign(
    SVGGlobal, {
    rect: SVGRectangle,
    circle: SVGCircle,
    ellipse: SVGEllipse,
    line: SVGLine,
    path: SVGPath,
    arc: SVGArc,

    vector: Vec2,
})