<script>

    import { page } from '$app/stores';

    let pages = [
        {url: "./", title: "Home"},
        {url: "./projects", title: "Projects"},
        {url: "./cv", title: "CV"}, 
        {url: "./contact", title: "Contact"}, 
        {url: "./meta", title: "Meta"},
        {url: "https://github.com/tedletsou", title: "Profile"}, 
        // add the rest of your pages here
    ];

    let colorScheme = "light dark";

    let localStorage = globalThis.localStorage ?? {};

    if (localStorage.colorScheme) {
	    colorScheme = localStorage.colorScheme;
    }

    let root = globalThis?.document?.documentElement;
    // root?.style.setProperty("color-scheme", colorScheme);
    $: root?.style.setProperty("color-scheme", colorScheme);

    $: localStorage.colorScheme = colorScheme;


</script>


<style>

    nav {

    --border-color: oklch(50% 10% 200 / 40%);

    /* Turns on flexbox for the navigation window */
    display: flex;
    margin-bottom: 2em;
    border-bottom-width: 1px;
    border-bottom-style: solid;
    /*border-bottom-color: oklch(80% 3% 200);*/
    border-bottom-color: var(--border-color);


    /* Apply some style to the links my nav bar */
    a {

        flex: 1;
        text-decoration: none;
        color: inherit;
        text-align: center;
        padding: 0.5em;

    }

    .current{

        border-bottom-width: 0.4em;
        border-bottom-style: solid;
        border-bottom-color: var(--border-color);
        padding-bottom: 0.4em;
        font-weight: bold;

    }

    a:hover {

        border-bottom-width: 0.4em;
        border-bottom-style: solid;
        border-bottom-color: var(--color-accent);
        padding-bottom: 0.4em;
        /*background-color: oklch(from var(--color-accent) 95% 5% h);*/
        background-color: color-mix(in oklch, var(--color-accent), canvas 95%);

    }

    }

    .color-scheme{

    position:absolute;
    top:1.5rem;
    right:2rem;
    font-size: 80%;

    }

</style>


<nav>
	{#each pages as p }
        <a href="{p.url}"class:current={ "." + $page.route.id === p.url } target={ p.url.startsWith("http") ? "_blank" : null }>{ p.title } </a>
	{/each} 
</nav>

<label class="color-scheme">
    Theme:
    <select bind:value={ colorScheme }>
        <option value="light dark">Automatic</option>
        <option value="light">Light</option>
        <option value="dark">Dark</option>
    </select>
</label>


<slot />