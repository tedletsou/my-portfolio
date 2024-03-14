<script>
import projects from '$lib/projects.json';
import Project from "$lib/Project.svelte";
</script>



<!-- <pre>{ JSON.stringify(projects, null, "\t") }</pre> -->

<svelte:head>
	<title>Projects</title>
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
    
    

<h1>{ projects.length } Projects</h1>
<div class="projects">
    {#each projects as p}
    <Project info={p} />
    {/each}
</div>