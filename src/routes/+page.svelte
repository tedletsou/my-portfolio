<script>
    import projects from '$lib/projects.json';
    import Project from "$lib/Project.svelte";
</script>

<svelte:head>
	<title>Home</title>
</svelte:head>

<style>

.projects {

display: grid;
grid-template-columns: repeat(auto-fill, minmax(15em, 1fr));
gap: 1em;

articles {

    grid-template-rows: subgrid;
    grid-row: span 3;

}

h2, h3 {

    margin: 0;

}

}

</style>

    
    <!-- <nav class="menu">
        <ul>
            <li><a> Home </a></li>
            <li><a href="projects/index.html">Projects</a></li>
            <li><a href="cv/index.html">CV</a></li>
            <li><a href="contact/index.html">Contact</a></li>
            <li><a href="https://github.com/tedletsou" target="_blank">Profile</a></li>
        </ul>
    </nav>  -->

    <h1>Ted Letsou</h1>
    <img src="images/ted_headshot_v6.jpg"
        alt="Headshot of Ted Letsou" />
    <p> Hi everyone!  Welcome to my website.  I know it doesn't look like much right now, but just you wait . . .</p>

    <h2>Recent Projects</h2>
        <div class="projects">
            {#each projects.slice(0, 3) as p}
            <Project info={p} hLevel=3/>
            {/each}
        </div>