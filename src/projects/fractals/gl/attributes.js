export class Attribute {
    /**
     * @param {WebGLBuffer} buffer - The buffer to bind to the attribute
     * @param {string} name - The name of the attribute
     * @param {number|[number,number]} size - The size of the attribute
     * @param {number} type - The type of the attribute
     * @param {boolean} [normalized] - Whether the attribute is normalized
     * @param {number} [stride] - The stride of the attribute
     * @param {number} [offset] - The offset of the attribute
     */
    constructor( buffer, name, size, type, normalized, stride, offset ) {
        this.buffer = buffer
        this.name = name
        this.size = size
        this.type = type
        this.normalized = normalized ?? false
        this.stride = stride ?? ( size instanceof Array ? size[0] * size[1] * 4 : 0 )
        this.offset = offset ?? 0
        this.divisor = 0
    }
    instanced( divisor = 1 ) {
        return this.divisor = divisor, this
    }
}