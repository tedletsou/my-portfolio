<script>

    import * as d3 from 'd3';

    import { onMount } from "svelte";

    let data = [];

    let commits = [];
    
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

</script>

<style>
	svg {
		overflow: visible;
	}

    .gridlines {
        stroke-opacity: .2;
    }

    circle {
        transition: 200ms;

        &:hover {
            transform: scale(1.5);
        }

        transform-origin: center;
        transform-box: fill-box;
    }

    dl.info {
        display: grid;
        grid-template-columns: max-content auto; /* First column for dt, second for dd */
        gap: 0.5em 1em; /* Space between rows and columns */
        margin: 0; /* Remove default margin */
        padding: 0.5em; /* Padding for the layout */
        font-size: 0.85em;
        color: #888;
    }

    dl.info dt {
        color: #888; /* Less prominent color for labels */
    }

    dl.info dd {
        margin: 0; /* Remove default margin for dd */
        color: #333; /* darker text color for dd elements */
        font-size: 1em; /* larger font size for dd elements */
    }

        /* Style for the tooltip */
    .tooltip {
        position: fixed;
        top: 1em;
        left: 1em;
        background-color: white; /* Background color for the tooltip */
        border: 1px solid #ddd; /* Border for the tooltip */
        box-shadow: 2px 2px 5px rgba(0,0,0,0.2);
        padding: 0.5em;
        border-radius: 4px;
        z-index: 1000;
    }

</style>

<h1>Meta</h1>

<h2>Commits by time of day</h2>
<svg viewBox="0 0 {width} {height}">

    <g transform="translate(0, {usableArea.bottom})" bind:this={xAxis} />
    <g transform="translate({usableArea.left}, 0)" bind:this={yAxis} />
    <g class="gridlines" transform="translate({usableArea.left}, 0)" bind:this={yAxisGridlines} />

    <g class="dots">
        {#each commits as commit, index }
            <circle
                cx={ xScale(commit.datetime) }
                cy={ yScale(commit.hourFrac) }
                r="5"
                fill="steelblue"
                on:mouseenter={evt => hoveredIndex = index}
                on:mouseleave={evt => hoveredIndex = -1}
            />
        {/each}

    </g>
    
</svg>

<!-- Information about data points-->
<dl id="commit-tooltip" class="info tooltip">
	<dt>COMMIT</dt>
	<dd><a href="{ hoveredCommit.url }" target="_blank">{ hoveredCommit.id }</a></dd>

	<dt>DATE</dt>
	<dd>{ hoveredCommit.datetime?.toLocaleString("en", {date: "full"}) }</dd>

    <dt>TIME</dt>
	<dd>{ hoveredCommit.datetime?.toLocaleString("en", {time: "full"}) }</dd>

    <dt>AUTHOR</dt>
	<dd>{ hoveredCommit.author?.toLocaleString("en") }</dd>

    <dt>LINES EDITED</dt>
	<dd>{ hoveredCommit.totalLines?.toLocaleString("en") }</dd>

	<!-- Add: Time, author, lines edited -->
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