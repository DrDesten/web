export default function ( globals, attributes, innerHTML ) {
    const title = attributes.title
    delete attributes.title
    const classes = attributes.class ?? ""
    delete attributes.class

    return `
        <section class="paragraph ${classes}" ${attributes}>
            ${title ? `<h3 class="paragraph">${title}</h3>` : ""}
            ${innerHTML}
        </section>
    `
}