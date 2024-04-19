<script>

    import * as d3 from 'd3';

    let arcGenerator = d3.arc().innerRadius(0).outerRadius(50);

    export let data = [];

    //let sliceGenerator = d3.pie().value(d => d.value);
    let sliceGenerator = d3.pie().value(d => d.value).sort(null);
    let arcData 
    let arcs;

    let oldData = [];
    let wedges = {};

    export let transitionDuration = 500;

    // $: arcData = sliceGenerator(data);
    // $: arcs = arcData.map(d => arcGenerator(d))
    
    export let colors = d3.scaleOrdinal(d3.schemeTableau10);

    export let selectedIndex = -1;

    function toggleWedge (index, event) {
        if (!event.key || event.key === "Enter") {
            selectedIndex = index;
        }
    }

    // copying the pie data
    let pieData;
    $: {
        oldData = pieData
        pieData = d3.sort(data, d => d.label);
        arcData = sliceGenerator(pieData);
        arcs = arcData.map(d => arcGenerator(d))
        pieData = pieData.map((d, i) => ({...d, ...arcData[i], arc: arcs[i]}));
        transitionArcs();
    };

    function transitionArcs() {
        let wedgeElements = Object.values(wedges);
        d3.selectAll(wedgeElements).transition("arc")
            .duration(transitionDuration)
            .styleTween("d", function (_, index) {
                let wedge = this;
                let label = Object.keys(wedges)[index];
                let transition = transitionArc(wedge, label);
                return transition?.interpolator;
            }).ease(d3.easeLinear);
    }

    function getEmptyArc (label, data = pieData) {
        // Union of old and new labels in the order they appear
        let labels = d3.sort(new Set([...oldData, ...pieData].map(d => d.label)));
        let labelIndex = labels.indexOf(label);
        let sibling;
        for (let i = labelIndex - 1; i >= 0; i--) {
            sibling = data.find(d => d.label === labels[i]);
            if (sibling) {
                break;
            }
        }

        let angle = sibling?.endAngle ?? 0;
        return {startAngle: angle, endAngle: angle};
    }

    function arc (wedge) {
        // Calculations that will only be done once per element go here
        // TODO use transitionArc() to get the data you need
        return {
            duration: transitionDuration,
            css: (t, u) => {
                // t is a number between 0 and 1 that represents the transition progress; u is 1 - t
                let wedge = this;
                // TODO return CSS to be applied for the current t as a string, e.g. `fill: red`
                let transition = transitionArc(wedge);
                return `{transition.interpolator(transition.type === "out" ? u : t)}`;
            }
        }
    }

    function transitionArc (wedge, label) {
        label ??= Object.entries(wedges).find(([label, w]) => w === wedge)[0];
        let d_old = oldData.find(d => d.label === label);
        let d = pieData.find(d => d.label === label);

        if (sameArc(d_old, d)) {
            return null;
        }

        let from = d_old ? {...d_old} : getEmptyArc(label, oldData);
        let to = d ? {...d} : getEmptyArc(label, oldData);
        let angleInterpolator = d3.interpolate(from, to);
        let type = d ? d_old ? "update" : "in" : "out";

        let interpolator = t => `path("${ arcGenerator(angleInterpolator(t)) }")`;

        return {d, d_old, from, to, interpolator};
    }

    function sameArc(d_old, d){
        // checks if either arc is undefined or null
        if(d_old === null || d_old === undefined || 
           d === null || d === undefined){
            return true;
        }

        // checks if both arcs have same start and end angle
        else if(d.startAngle == d.endAngle && d_old.endAngle == d.endAngle){
            return true;
        }

        // defaults to arcs not being the same
        return false;
    } 

</script>

<div class="container">

    <svg viewBox="-50 -50 100 100">
        {#each pieData as d, index}
            <path d={d.arc} fill={ colors(d.id ?? d.label) } 
                class:selected={selectedIndex === index}
                on:click={e => toggleWedge(selectedIndex = selectedIndex === index ? -1 : index, e)}
                on:keyup={e => toggleWedge(selectedIndex = selectedIndex === index ? -1 : index, e)}
                tabindex="0"
                role="button"
                transition:arc
                bind:this={ wedges[d.label] }
                aria-label/>
        {/each}
    </svg>

    <ul class="legend">
        {#each pieData as d, index (d.label)}
            <li style="--color: { colors(d.label) }"
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
        transition-property: transform, opacity, fill;
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




