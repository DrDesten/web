export default function ( globals, attributes ) {
    return `
        <div id="background" style="position:absolute;top:0;bottom:0;right:0;left:0;z-index:-1;mask-image:linear-gradient(to bottom,rgba(0,0,0,1),rgba(0,0,0,0));"></div>
        <script type="module" src="background.js"></script>
    `
}