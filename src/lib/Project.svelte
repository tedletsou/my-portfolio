<article>
    <svelte:element this={"h" + hLevel}>{ info.title }</svelte:element>
    <img src={info.image} alt="">
    <p>{info.description}</p>
</article>

<script>
    export let info = {};
    // let p = info;
    export let hLevel = 2;
</script>
