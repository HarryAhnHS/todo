import './style/style.css';
import Git from './images/github.png';

import Storage from './storage';

import Todo from './todo.js';
import Project from './project.js';
import ProjectList from './projectList.js';
import UI from './UI.js';
import { add } from 'date-fns';

document.querySelector("#github").src = Git;

function toggleSidebar() {
    const sidebar = document.querySelector(".sidebar");
    const projects = document.querySelectorAll(".project");
    const projectTitle = document.querySelector(".my-projects-title");
    const body = document.querySelector("body");

    const header = document.querySelector(".header");
    const main = document.querySelector(".main");
    // Closing
    if (sidebar.classList.contains('opened')) {
        sidebar.classList.add('closed');
        body.style['grid-template-columns'] = "60px auto";

        header.style['grid-area'] = "1/1/2/3";
        main.style['grid-area'] = "2/1/3/3";

        projects.forEach(project => {
            project.classList.add('hidden');
        })
        projectTitle.classList.add('hidden');

        sidebar.classList.remove('opened');
    }
    // Opening
    else {
        sidebar.classList.remove('closed');
        body.style['grid-template-columns'] = "200px auto";

        header.style['grid-area'] = "1/2/2/3";
        main.style['grid-area'] = "2/2/3/3";

        projects.forEach(project => {
            project.classList.remove('hidden');
        })
        projectTitle.classList.remove('hidden');

        sidebar.classList.add('opened');
    }
}

function toggleSidebarMobile() {
    const sidebar = document.querySelector(".sidebar");
    const projects = document.querySelectorAll(".project");
    const projectTitle = document.querySelector(".my-projects-title");
    const body = document.querySelector("body");

    const header = document.querySelector(".header");
    const main = document.querySelector(".main");
    // Closing
    if (sidebar.classList.contains('opened')) {
        sidebar.classList.add('closed');
        body.style['grid-template-columns'] = "0px auto";

        header.style['grid-area'] = "1/1/2/3";
        main.style['grid-area'] = "2/1/3/3";

        projects.forEach(project => {
            project.classList.add('hidden');
        })
        projectTitle.classList.add('hidden');

        sidebar.classList.remove('opened');
    }
    // Opening
    else {
        sidebar.classList.remove('closed');
        body.style['grid-template-columns'] = "200px auto";

        header.style['grid-area'] = "1/1/2/3";
        main.style['grid-area'] = "2/1/3/3";

        projects.forEach(project => {
            project.classList.remove('hidden');
        })
        projectTitle.classList.remove('hidden');

        sidebar.classList.add('opened');
    }

}

function myFunction(x) {
    if (x.matches) { // If media query matches (smaller than 650px)
        document.querySelector(".open-close").onclick  = toggleSidebarMobile
    } else {
    // If normal
        document.querySelector(".open-close").onclick = toggleSidebar;
    }
}
  
// Create a MediaQueryList object
var x = window.matchMedia("(max-width: 650px)")

//localStorage.clear();
UI.initDisplay();
UI.refreshCurrentProjects();
UI.newProject();

// Call listener function at run time
myFunction(x);

// Attach listener function on state changes
x.addEventListener("change", function() {
    myFunction(x);
});


