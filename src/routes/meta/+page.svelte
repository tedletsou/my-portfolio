<script>

    import * as d3 from 'd3';

    import { onMount } from "svelte";

    import Pie from "$lib/Pie.svelte";
    import CommitScatterplot from "./Scatterplot.svelte";
    import FileLines from "./FileLines.svelte";
    import Scrolly from "svelte-scrolly";

    let colors = d3.scaleOrdinal(d3.schemeTableau10);
    

    import {
        computePosition,
        autoPlacement,
        offset,
    } from '@floating-ui/dom';

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

        // console.log(commits)

    });

    let data = [];
    let commits = [];

    // scaling the commits from 0 to 100
    let commitProgress = 100;
    let commitMaxTime; 
    let timeScale = d3.scaleTime();
    $: timeScale = timeScale.domain(d3.extent(commits, d => d.datetime)).range([0, 100]);
    $: commitMaxTime = timeScale.invert(commitProgress);

    // scaling the commits from 0 to 100
    let raceProgress = 100;
    let raceMaxTime; 
    let raceScale = d3.scaleTime();
    $: raceScale = raceScale.domain(d3.extent(commits, d => d.datetime)).range([0, 100]);
    $: raceMaxTime = raceScale.invert(raceProgress);

    // Filtering the commits
    let filteredCommits;
    let filteredLines;
    $: filteredCommits = commits.filter((commit) =>  commit.datetime < commitMaxTime);
    $: filteredLines = data.filter((d) => d.datetime < commitMaxTime);

     // Filtering the race commits
    let raceCommits;
    let raceLines;
    $: raceCommits = commits.filter((commit) =>  commit.datetime < raceMaxTime);
    $: raceLines = data.filter((d) => d.datetime < raceMaxTime);

    $: fileLengths = d3.rollups(data, v => d3.max(v, v => v.line), d => d.file);
    $: averageFileLength = d3.mean(fileLengths, d => d[1]);

    $: workByPeriod = d3.rollups(data, v => v.length, d => d.datetime.toLocaleString("en", {dayPeriod: "short"}));
    $: maxPeriod = d3.greatest(workByPeriod, (d) => d[1])?.[0];

    let selectedCommits = [];
    $: hasSelection = selectedCommits.length > 0;
    $: selectedLines = (hasSelection ? selectedCommits : filteredCommits).flatMap(d => d.lines);
    $: languageBreakdown = d3.rollups(selectedLines, lines => lines.length, line => line.type);
    // $: languageBreakdown = d3.rollups(selectedLines, v => d3.sum(v, d => d.length), d => d.type);

    const formatPercentage = d3.format(".1~%");
</script>

<style>

    :global(body){
            max-width: min(120ch, 80vw);
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
        transition-duration: 1000ms;
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

    .selected {
        fill: red;
    }

    .slider{
        flex: 1;
        width: 100%;
    }

    .timeLabel{
        grid-column: 2;
        text-align: left;
    }

</style>

<h1>Meta</h1>

<h2>Commits by time of day</h2>

<label class="filtering">
    <p>Show commits until:</p> 
    <input class="slider" type="range" min="1" max="100" bind:value={commitProgress}>
    <time class="timeLabel">{commitMaxTime.toLocaleString("en", {dateStyle: "long", timeStyle: "short"})}</time> 
</label>

<p>{hasSelection ? selectedCommits.length : "No"} commits selected</p>

<Scrolly bind:progress={commitProgress}>
	{#each commits as commit, index }
        <p>
            On {commit.datetime.toLocaleString("en", {dateStyle: "full", timeStyle: "short"})},
            I made <a href="{commit.url}" target="_blank">{ index > 0 ? 'another glorious commit' : 'my first commit, and it was glorious' }</a>.
            I edited {commit.totalLines} lines across { d3.rollups(commit.lines, D => D.length, d => d.file).length } files.
            Then I looked over all I had made, and I saw that it was very good.
        </p>
    {/each}
	<svelte:fragment slot="viz">
		<CommitScatterplot commits={filteredCommits} bind:selectedCommits={selectedCommits} />
        <Pie data={Array.from(languageBreakdown).map(([language, lines]) => ({label: language, value: lines}))} colors={colors}/>
	</svelte:fragment>
</Scrolly>

<Scrolly bind:progress={raceProgress} --scrolly-layout="viz-first" --scrolly-viz-width="1.5fr">
	{#each commits as commit, index }
        <p>
            On {commit.datetime.toLocaleString("en", {dateStyle: "full", timeStyle: "short"})},
            I made <a href="{commit.url}" target="_blank">{ index > 0 ? 'another glorious commit' : 'my first commit, and it was glorious' }</a>.
            I edited {commit.totalLines} lines across { d3.rollups(commit.lines, D => D.length, d => d.file).length } files.
            Then I looked over all I had made, and I saw that it was very good.
        </p>
    {/each}
	<svelte:fragment slot="viz">
        <FileLines lines={filteredLines} colors={colors}/>
	</svelte:fragment>
</Scrolly>


<h2>Summary</h2>
<section class="stats">

    <dl>
        
        <dt>TOTAL <abbr title="Lines of code">LOC</abbr></dt>
        <dd>{filteredLines.length}</dd>

        <dt>MAXIMUM DEPTH</dt>
        <dd>{d3.max(filteredLines, d => d.depth)}</dd>

        <dt>NUMBER OF FILES</dt>
        <dd>{d3.group(filteredLines, d => d.file).size}</dd>

        <dt>AVERAGE FILE LENGTH</dt>
        <dd>{averageFileLength}</dd>

        <dt>TIME OF UPDATES</dt>
        <dd>{maxPeriod}</dd>

        <dt>NUMBER OF COMMITS</dt>
        <dd>{d3.group(filteredLines, d => d.commit).size}</dd>

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


