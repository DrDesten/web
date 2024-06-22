import path from "path"

export default function ( globals, { style } ) {
    const links = [
        { path: "/", text: "Home"},
        { path: "projects/", text: "Projects"},
        { path: "tools/", text: "Tools"},
    ]

    for ( const link of links ) {
        const absolute = path.join( globals.ROOT, link.path )
        const relative = path.relative( globals.DIRNAME, absolute )
        link.path = relative
    }

    return `
        <nav>
            <table class="nav" ${style ? `style="${style}"` : ""}>
                <tr class="nav">
                    ${
                        links.map( ({path, text}) => `
                            <th class="nav">
                                <a class="nav" href="${path}">${text}</a>
                            </th>
                        `).join("\n")
                    }
                </tr>
            </table>
        </nav>
        <div id="nav-padding"></div>
    `
}