export default function ( globals, attributes ) {
    return `
        <div id="background" style="position:fixed;top:0;bottom:0;right:0;left:0;z-index:-1;"></div>
        <script type="module" src="background.js"></script>
    `
}