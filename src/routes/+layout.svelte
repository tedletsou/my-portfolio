<script>
let pages = [
	{url: "./", title: "Home"},
	{url: "./projects", title: "Projects"},
    {url: "./cv", title: "CV"}, 
    {url: "./contact", title: "Contact"}, 
    {url: "https://github.com/tedletsou", title: "Profile"}, 
	// add the rest of your pages here
];
import { page } from '$app/stores';
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

</style>

<nav>
	{#each pages as p }
        <a href="{p.url}"class:current={ "." + $page.route.id === p.url } target={ p.url.startsWith("http") ? "_blank" : null }>{ p.title } </a>
	{/each} 
</nav>

<slot />