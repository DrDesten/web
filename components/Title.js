export default function ( globals, { text } ) {
    return `
        <header class="fillscreen">
            <div class="fillscreen-center">
                <h1 class="typewriter">${text}</h1>
            </div>
            <div class="fillscreen-bottom">
                <img src="angle down.svg">
            </div>
        </header>
    `
}