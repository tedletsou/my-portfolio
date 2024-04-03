<script>

    import * as d3 from 'd3';

    import { onMount } from "svelte";

    let data = [];

    let commits = [];

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
                url: "https://github.com/vis-society/lab-7/commit/" + commit,
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

    $: fileLengths = d3.rollups(data, v => d3.max(v, v => v.line), d => d.file);
    $: averageFileLength = d3.mean(fileLengths, d => d[1]);

    $: workByPeriod = d3.rollups(data, v => v.length, d => d.datetime.toLocaleString("en", {dayPeriod: "short"}))
    $: maxPeriod = d3.greatest(workByPeriod, (d) => d[1])?.[0];
    
    let width = 1000, height = 600;

    const xScale = d3.scaleTime()
        .domain(d3.extent(commits, commit => commit.datetime)) // Use d3.extent to get min and max dates
        .range([0, width]) // Map to the horizontal range of the SVG
        .nice(); // Extend the domain to nice round values

    const yScale = d3.scaleLinear()
        .domain([0, 24]) // Hours of the day
        .range([height, 0]) // SVG's height to 0 (inverted because SVG's Y axis is inverted)
        .nice(); // Extend the domain to nice round values

</script>

<style>
	svg {
		overflow: visible;
	}
</style>

<h1>Meta</h1>

<h2>Commits by time of day</h2>
<svg viewBox="0 0 {width} {height}">

    <g class="dots">
        {#each commits as commit, index }
            <circle
                cx={ xScale(commit.datetime) }
                cy={ yScale(commit.hourFrac) }
                r="5"
                fill="steelblue"
            />
        {/each}
    </g>
	<!-- scatterplot will go here -->
</svg>

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
        <dd>{d3.group(data, d => d.commits).size}</dd>

    </dl>

</section>