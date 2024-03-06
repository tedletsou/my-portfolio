<svelte:head>
	<title>Contact me</title>
</svelte:head>
    
    <!-- <nav class="menu">
        <ul>
            <li><a href="../index.html">Home</a></li>
            <li><a href="../projects/index.html">Projects</a></li>
            <li><a href="../cv/index.html">CV</a></li>
            <li><a> Contact </a></li>
            <li><a href="https://github.com/tedletsou" target="_blank">Profile</a></li>
        </ul>
    </nav>  -->
    <h1>Contact</h1>
    <form action="mailto:tletsou@mit.edu" method="POST" enctype="text/plain" >
        <label for="email"> Email:
            <input type="email" name="email" value="testmail@mit.edu">
        </label>
        <label for="subject"> Subject:
            <input name="subject" value="Test body">
        </label>
        <label for="body">Body:
            <textarea name="body">It was a dark and stormy night...</textarea>
        </label>
        <button>Submit</button>
    </form>