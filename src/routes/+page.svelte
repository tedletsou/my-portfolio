<script>
    
    import projects from '$lib/projects.json';
    import Project from "$lib/Project.svelte";
    // let profileData = fetch("https://api.github.com/users/tedletsou");


    // let profileData = {
    //     ok: true,
    //     json: async () => ({
    //         followers: 100,
    //         following: 100,
    //         public_repos: 100,
    //         public_gists: 100,
    //     })
    // };
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

<section class="stats">

    <h2> My GitHub Stats</h2>

    {#await fetch("https://api.github.com/users/tedletsou") }
        <p>Loading...</p>

    {:then response}
        {#await response.json()}
            <p>Decoding...</p>
        {:then data}

            <dl>
                <dt>FOLLOWERS</dt>
                <dd>{ data.followers }</dd>

                <dt>FOLLOWING</dt>
                <dd>{ data.following }</dd>

                <dt>PUBLIC REPOS</dt>
                <dd>{ data.public_repos }</dd>

                <dt>PUBLIC GISTS</dt>
                <dd>{ data.public_gists }</dd>
            </dl>
            
        {:catch error}
            <p class="error">
                Something went wrong: {error.message}
            </p>
        {/await}

    {:catch error}
        <p class="error">
            Something went wrong: {error.message}
        </p>
    {/await}

</section>


<h2>Recent Projects</h2>
<div class="projects">
    {#each projects.slice(0, 3) as p}
    <Project info={p} hLevel=3/>
    {/each}
</div>
