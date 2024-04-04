<script>

    import * as d3 from 'd3';

    import { onMount } from "svelte";

    import Pie from "$lib/Pie.svelte";

    import {
        computePosition,
        autoPlacement,
        offset,
    } from '@floating-ui/dom';

    let data = [];

    let commits = [];
    
    let commitTooltip;
    
    let width = 1000, height = 600;

    onMount(async () => {
        data = await d3.csv("loc.csv", row => ({
            ...row,
            line: Number(row.line), // or just +row.line
            depth: Number(row.depth),
            length: Number(row.length),
            date: new Date(row.date + "T00:00" + row.timezone),
            datetime: new Date(row.datetime)
        }));
        
        commits = d3.groups(data, d => d.commit).map(([commit, lines]) => {
            let first = lines[0];
            let {author, date, time, timezone, datetime} = first;
            let ret = {
                id: commit,
                url: "https://github.com/tedletsou/my-portfolio/commit/" + commit,
                author, date, time, timezone, datetime,
                hourFrac: datetime.getHours() + datetime.getMinutes() / 60,
                totalLines: lines.length
            };

            // Like ret.lines = lines
            // but non-enumerable so it doesn’t show up in JSON.stringify
            Object.defineProperty(ret, "lines", {
                value: lines,
                configurable: true,
                writable: true,
                enumerable: false,
            });

            return ret;

        });

        console.log(commits)

    });

    let margin = {top: 10, right: 10, bottom: 30, left: 20};

    let usableArea = {
        top: margin.top,
        right: width - margin.right,
        bottom: height - margin.bottom,
        left: margin.left
    };
    usableArea.width = usableArea.right - usableArea.left;
    usableArea.height = usableArea.bottom - usableArea.top;

    let xAxis, yAxis;

    $: fileLengths = d3.rollups(data, v => d3.max(v, v => v.line), d => d.file);
    $: averageFileLength = d3.mean(fileLengths, d => d[1]);

    $: workByPeriod = d3.rollups(data, v => v.length, d => d.datetime.toLocaleString("en", {dayPeriod: "short"}));
    $: maxPeriod = d3.greatest(workByPeriod, (d) => d[1])?.[0];

    // Create the Y scale (for times of day)
    $: yScale = d3.scaleLinear()
        .domain([0, 24]) // hours in a day
        .range([usableArea.bottom, usableArea.top]);

    // Create the X scale (for dates)
    $: xScale = d3.scaleTime()
        .domain(d3.extent(data, d => d.date))
        .range([usableArea.left, usableArea.right])
        .nice(); // Adjusts the domain to fit nicely

    $: {
        d3.select(xAxis).call(d3.axisBottom(xScale));
        d3.select(yAxis).call(d3.axisLeft(yScale).tickFormat(d => String(d % 24).padStart(2, "0") + ":00"));
    }

    // creating grid lines

    let yAxisGridlines;

    $: {
        d3.select(yAxisGridlines).call(
            d3.axisLeft(yScale)
            .tickFormat("")
            .tickSize(-usableArea.width)
        );
    }

    // Tool tips
    let hoveredIndex = -1;
    $: hoveredCommit = commits[hoveredIndex] ?? {};

    // Cursor position 

    let tooltipPosition = {x: 0, y: 0};

    async function dotInteraction (index, evt) {
        if (evt.type === "mouseenter" || evt.type === "focus") {
            hoveredIndex = index,
            tooltipPosition = {x: evt.x, y: evt.y}
        }
        else if (evt.type === "mouseleave" || evt.type === "blur") {
            hoveredIndex = -1
        }

        let hoveredDot = evt.target;

        tooltipPosition = await computePosition(hoveredDot, commitTooltip, {
            strategy: "fixed", // because we use position: fixed
            middleware: [
                offset(5), // spacing from tooltip to dot
                autoPlacement() // see https://floating-ui.com/docs/autoplacement
            ],
        });

    }

    let brushSelection;
    function brushed (evt) {
        brushSelection = evt.selection;
    }

    // brushing
    let svg
    $: {
        d3.select(svg).call(d3.brush().on("start brush end", brushed));
        d3.select(svg).selectAll(".dots, .overlay ~ *").raise();
    }

    function isCommitSelected (commit) {
        if (!brushSelection) {
            return false;
        }
        let min = {x: brushSelection[0][0], y: brushSelection[0][1]};
        let max = {x: brushSelection[1][0], y: brushSelection[1][1]};
        let x = xScale(commit.date);
        let y = yScale(commit.hourFrac);
        return x >= min.x && x <= max.x && y >= min.y && y <= max.y;
    }

    $: selectedCommits = brushSelection ? commits.filter(isCommitSelected) : [];
    $: hasSelection = brushSelection && selectedCommits.length > 0;

    $: selectedLines = (hasSelection ? selectedCommits : commits).flatMap(d => d.lines);
    $: languageBreakdown = d3.rollups(selectedLines, lines => lines.length, line => line.type);

    const formatPercentage = d3.format(".1~%");
</script>

<style>
	svg {
		overflow: visible;
	}

    .gridlines {
        stroke-opacity: .2;
    }

    circle {
        transition: 500ms;
        transform-origin: center;
        transform-box: fill-box;

        &:hover {
            transform: scale(1.5);
        }

        
    }

    dl.info {
        display: grid;
        grid-template-columns: max-content auto; 
        gap: 0.5em 1em; 
        margin: 0; 
        padding: 1em; 
        font-size: 0.85em;
        color: #888;

        /* ... other styles ... */
        transition-duration: 500ms;
        transition-property: opacity, visibility;

        &[hidden]:not(:hover, :focus-within) {
            opacity: 0;
            visibility: hidden;
        }
    }

    dl.info dt {
        color: #888; 
    }

    dl.info dd {
        margin: 0; 
        color: #333; 
        font-size: 1em; 
    }
    
    /* Style for the tooltip */
    .tooltip {
        position: fixed;
        top: 1em;
        left: 1em;
        background-color: oklch(100% 0% 0 / 80%); /* Background color for the tooltip */
        border: 1px solid #ddd; /* Border for the tooltip */
        /* box-shadow: 2px 2px 5px rgba(0,0,0,0.2); */
        padding: 1em;
        border-radius: 4px;
        box-shadow: 3px 3px 3px;
    }

    .selected {
        fill: red;
    }

</style>

<h1>Meta</h1>

<h2>Commits by time of day</h2>

<p>{hasSelection ? selectedCommits.length : "No"} commits selected</p>

<svg viewBox="0 0 {width} {height}" bind:this = {svg}>

    <g transform="translate(0, {usableArea.bottom})" bind:this={xAxis} />
    <g transform="translate({usableArea.left}, 0)" bind:this={yAxis} />
    <g class="gridlines" transform="translate({usableArea.left}, 0)" bind:this={yAxisGridlines} />

    <g class="dots">
        {#each commits as commit, index }
            <circle
                class:selected={isCommitSelected(commit)}
                cx={ xScale(commit.date) }
                cy={ yScale(commit.hourFrac) }
                r="5"
                fill="steelblue"
                tabindex="0"
                aria-describedby="commit-tooltip"
                aria-haspopup="true"
                on:mouseenter={evt => dotInteraction(index, evt)}
                on:mouseleave={evt => dotInteraction(index, evt)}
                on:focus={evt => dotInteraction(index, evt)}
                on:blur={evt => dotInteraction(index, evt)}
            />
        {/each}

    </g>
    
</svg>

<!-- Information about data points-->
<dl id="commit-tooltip" class="info tooltip" hidden={hoveredIndex === -1} style="top: {tooltipPosition.y}px; left: {tooltipPosition.x}px" bind:this={commitTooltip} role="tooltip">
    
	<dt>COMMIT</dt>
	<dd><a href="{ hoveredCommit.url }" target="_blank">{ hoveredCommit.id }</a></dd>

	<dt>DATE</dt>
	<dd>{ hoveredCommit.datetime?.toLocaleString("en", {date: "short"}) }</dd>

    <dt>TIME</dt>
	<dd>{ hoveredCommit.time?.toLocaleString("en", {date: "long"})}</dd>

    <dt>AUTHOR</dt>
	<dd>{ hoveredCommit.author?.toLocaleString("en") }</dd>

    <dt>LINES EDITED</dt>
	<dd>{ hoveredCommit.totalLines?.toLocaleString("en") }</dd>

</dl>

<h2>Summary</h2>
<section class="stats">

    <dl>
        
        <dt>TOTAL <abbr title="Lines of code">LOC</abbr></dt>
        <dd>{data.length}</dd>

        <dt>MAXIMUM DEPTH</dt>
        <dd>{d3.max(data, d => d.depth)}</dd>

        <dt>NUMBER OF FILES</dt>
        <dd>{d3.group(data, d => d.file).size}</dd>

        <dt>AVERAGE FILE LENGTH</dt>
        <dd>{averageFileLength}</dd>

        <dt>TIME OF UPDATES</dt>
        <dd>{maxPeriod}</dd>

        <dt>NUMBER OF COMMITS</dt>
        <dd>{d3.group(data, d => d.commit).size}</dd>

    </dl>

</section>

<section class="stats">
    <dl>
    {#each languageBreakdown as [language, lines] }

        <dt>{language}</dt>
        <dd>{lines} lines, {formatPercentage(lines / selectedLines.length)}</dd>

    {/each}
    </dl>
</section>


<Pie data={Array.from(languageBreakdown).map(([language, lines]) => ({label: language, value: lines}))} />