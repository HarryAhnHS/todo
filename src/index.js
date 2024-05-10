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
    const addProject = document.querySelector(".sidebar-add");
    const body = document.querySelector("body");
    // Closing
    if (sidebar.classList.contains('opened')) {
        body.style['grid-template-columns'] = "50px auto";
        
        sidebar.style['width'] = "50px";
        sidebar.style['border-right'] = 'none';


        projects.forEach(project => {
            project.classList.add('hidden');
        })
        projectTitle.classList.add('hidden');
        addProject.classList.add('hidden');

        sidebar.classList.remove('opened');
    }
    // Opening
    else {
        body.style['grid-template-columns'] = "1fr 4fr";

        sidebar.style['width'] = "100%";

        projects.forEach(project => {
            project.classList.remove('hidden');
        })
        projectTitle.classList.remove('hidden');
        addProject.classList.remove('hidden');

        sidebar.classList.add('opened');
    }
}

document.querySelector(".open-close").onclick = toggleSidebar;

localStorage.clear();

Storage.addProject(new Project('Dog'));
Storage.addProject(new Project('Cat'));

let newTodo = new Todo("Maru","Maru is a dog",new Date(2024,3,16),'High');

Storage.addTodo('Dog', newTodo);

console.log("Deleting cat");
Storage.deleteProject('Cat');

Storage.renameProject('Dog', 'Maru');

Storage.renameTodo('Maru','Maru','Feed Maru');

Storage.addProject(new Project('Meow'));

Storage.addTodo('Meow', new Todo("Clean Catnip","", new Date(2024,3,21),'Low'))

Storage.changeDoneTodo('Meow','Clean Catnip',true);

Storage.addTodo('Meow', new Todo("Buy Tuna","Need Fish", new Date(2024,1,21),'Low'))

Storage.addTodo('Maru', new Todo("Buy Cheese","His favorite treat", new Date(2024,3,19),'Low'))

Storage.addTodo('Maru', new Todo("Clean Poo","", new Date(2024,3,19,13,30),'Low'))
Storage.addTodo('Maru', new Todo("Clean Piss","", new Date(2024,3,19,11,30),'Low'))

Storage.changeDateTodo('Meow','Buy Tuna', new Date(2024,4,8,12,30))
Storage.changeDateTodo('Maru','Buy Cheese', new Date(2024,4,13,23,30))


UI.initDisplay();
UI.displayProjects();
UI.displaySelectedProjectContent();
UI.newProject();

