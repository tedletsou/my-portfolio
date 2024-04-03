<script>

    import * as d3 from 'd3';

    let arcGenerator = d3.arc().innerRadius(0).outerRadius(50);

    export let data = [];

    let sliceGenerator = d3.pie().value(d => d.value);
    let arcData 
    let arcs;

    $: arcData = sliceGenerator(data);
    $: arcs = arcData.map(d => arcGenerator(d))
    
    let colors = d3.scaleOrdinal(d3.schemeTableau10);

    export let selectedIndex = -1;

    function toggleWedge (index, event) {
        if (!event.key || event.key === "Enter") {
            selectedIndex = index;
        }
    }

</script>

<div class="container">

    <svg viewBox="-50 -50 100 100">
        {#each arcs as arc, index}
            <path d={ arc } fill={ colors(index) } 
                class:selected={selectedIndex === index}
                on:click={e => toggleWedge(selectedIndex = selectedIndex === index ? -1 : index, e)}
                on:keyup={e => toggleWedge(selectedIndex = selectedIndex === index ? -1 : index, e)}
                tabindex="0"
                role="button"
                aria-label/>
        {/each}
    </svg>

    <ul class="legend">
        {#each data as d, index}
            <li style="--color: { colors(index) }"
            class:selected={selectedIndex === index}>
                <span class="swatch"></span>
                {d.label} <em>({d.value})</em>
            </li>
        {/each}
    </ul>

</div>


<style>

    svg:has(path:hover, path:focus-visible) {
        path:not(:hover, :focus-visible) {
            opacity: 50%;
        }
    }
        
    path {
        transition: 300ms;
        outline: none;
    }

    .selected {
        --color: oklch(20% 45% 0) !important;

        &:is(path) {
            fill: var(--color);
        }
    }

    svg {
        max-width: 20em;
        margin-block: 2em;

        /* Do not clip shapes outside the viewBox */
        overflow: visible;
    }
    
    /* Style for the swatches */
    .swatch {
        width: 16px; /* Set the width */
        height: 16px; /* Set the height */
        background-color: var(--color); /* Use the provided color */
        border-radius: 50%; /* Makes it a circle, change to less for rounded corners */
        display: inline-block; /* Allows width and height to work on a span */
    }

    /* Style for the overall list (legend) */
    ul.legend {
        display: grid; /* Using grid layout */
        grid-template-columns: repeat(auto-fill, minmax(9em, 1fr)); /* Responsive grid layout */
        gap: 20px; /* Space between items */
        border: 1px solid #ccc; /* Border around the legend */
        padding: 10px; /* Padding inside the legend */
        margin: 10px; /* Margin around the legend */
        flex: 1
    }

    /* Style for each list item */
    ul.legend li {
        display: flex; /* Flex layout for aligning swatch and text */
        align-items: center; /* Vertical center alignment */
        gap: 10px; /* Space between swatch and text */
    }

    .container {
        display: flex; /* Enable flex layout */
        align-items: center; /* Align items vertically */
        gap: 20px; /* Spacing between the pie chart and the legend */
    }

</style>




