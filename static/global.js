console.log("IT’S ALIVE!");

function $$ (selector, context = document) {
	return Array.from(context.querySelectorAll(selector));
}

// let navLinks = $$("nav a")
// let currentLink = navLinks.find(a => a.host === location.host && a.pathname === location.pathname)

// if (currentLink) { // or if (currentLink !== undefined)
// 	currentLink.classList.add("current");
// }

// let pages = {
//     ".": "Home",
//     "projects": "Projects",
//     "cv": "CV",
//     "contact": "Contact",
//     "https://github.com/tedletsou": "Profile",
// };

// let nav = document.createElement("nav");
// document.body.prepend(nav)

// // looping over pages and creating links
// for (let url in pages) {
// 	let title = pages[url];

//     // // Check if we are on the home page
//     // const ARE_WE_HOME = document.documentElement.classList.contains("home");
//     // if (!ARE_WE_HOME && !url.startsWith("http")) {
//     //     url = "../" + url;
//     // }

//     // Create link and add it to nav
//     let a = document.createElement("a");
//     a.href = url;
//     a.textContent = title;
//     nav.append(a);

//     if (a.host === location.host && a.pathname === location.pathname) {
//         a.classList.add("current");
//     }

//     // unsure why this isn't working...
//     if (a.host !== location.host) {
//         a.target = "_blank";
//     }
    
// };

// document.body.insertAdjacentHTML("afterbegin", `
// 	<label class="color-scheme">
// 		Theme:
// 		<select>
// 			<option value="light dark">Automatic</option>
//             <option value="light">Light</option>
//             <option value="dark">Dark</option>
// 		</select>
// 	</label>`
// );

// let select = document.querySelector("select");

// if (localStorage.colorScheme !== 0) {
//     document.documentElement.style.setProperty("color-scheme", localStorage.colorScheme);
// }

// select.addEventListener("input", function (event) {
// 	console.log("color scheme changed to", event.target.value);
//     document.documentElement.style.setProperty("color-scheme", event.target.value);
//     localStorage.colorScheme = event.target.value
// });


