import Todo from './todo.js';
import Project from './project.js';
import ProjectList from './projectList.js';
import Storage from './storage.js';

import { isPast, isWithinInterval, formatDistance, formatDistanceToNow, format } from 'date-fns';

const UI = (() => {

    function refreshCurrentProjects() {
        displaySidebarProjects();
        clickProjectSidebar();
    }

    function refreshCurrentTodos() {
        const projects = document.querySelectorAll(".project");
        projects.forEach((project) => {
            if (project.classList.contains("active")) {
                clearTodos();

                if (project.classList.contains("new")) displayTodos(project.textContent.slice(2).toUpperCase());
                else displayTodos(project.textContent);
            }
        })
    }

    function initDisplay() {
        const projectDivs = document.querySelectorAll('.project');
        const projectName = document.querySelector('.main-head');

        projectDivs.forEach((project) => {
            console.log(project.textContent);
            if (project.textContent == 'ALL') {
                resetActive();
                project.classList.add("active");
                projectName.textContent = "All";
                clearTodos();
                Storage.getProjectList().updateAll();
                displayTodos('ALL');
            }
        });
    };

    /**
     * Function to create and create DOM for default projects in sidebar
     */
    function initSidebar() {
        const sidebar = document.querySelector('.sidebar-defaults');

        sidebar.innerHTML = "";
        const all = document.createElement('div');
        all.classList.add("project");
        all.classList.add("active");
        all.textContent = "ALL";

        const today = document.createElement('div');
        today.classList.add("project");
        today.textContent = "TODAY";

        const thisweek = document.createElement('div');
        thisweek.classList.add("project");
        thisweek.textContent = "THIS WEEK";

        const done = document.createElement('div');
        done.classList.add("project");
        done.textContent = "DONE";

        const myProjectsTitle = document.createElement('div');
        myProjectsTitle.classList.add("my-projects-title");
            const span = document.createElement('span');
            span.textContent = "My Projects";

            const i = document.createElement('i');
            i.setAttribute('id',"new-project");
        
        myProjectsTitle.appendChild(span);
        myProjectsTitle.appendChild(i);

        sidebar.appendChild(all);
        sidebar.appendChild(today);
        sidebar.appendChild(thisweek);
        sidebar.appendChild(done);
        sidebar.appendChild(myProjectsTitle);
    }


    /**
     * Function to create and create DOM for new projects in sidebar
     */
    function displaySidebarProjects() {
        // Clear Previous ProjectList
        const myProjectList = document.querySelector('.my-projects');
        myProjectList.innerHTML = "";

        Storage.getProjectList().getProjects().forEach((project) => {
            if (project.name != 'ALL' && project.name != 'TODAY' && project.name != 'THIS WEEK' && project.name != 'DONE') {
                UI.createProject(project.name);
            }
        });
    }

    /**
     * helper function to createproject element and append
     * @param {*} name project name
     */
    function createProject(name) {
        const myProjectList = document.querySelector('.my-projects');

        const project = document.createElement('div');
        project.classList.add('project');
        project.classList.add('new');

        const sharp = document.createElement('span');
        sharp.innerHTML = `#&nbsp;`;
        sharp.style['pointer-events'] = 'none';

        const projectName = document.createElement('div');
        projectName.textContent = `${name}`;
        projectName.style['pointer-events'] = 'none';

        sharp.style['color'] = `#${Storage.getProjectList().getProject(name).getColor()}`;

        project.appendChild(sharp);
        project.appendChild(projectName);

        myProjectList.appendChild(project);
    }

    function displayTodos(projectName) {
        if (Storage.getProjectList().getProject(projectName).getTodos().length == 0) {
            // Edge-case - if no todos
            if (projectName == "DONE") {
                // No done todos
                const todoList = document.querySelector('.todo-list');

                const emptySaver = document.createElement("div");
                emptySaver.classList.add("empty-saver");

                const emoji = document.createElement("div");
                emoji.classList.add("emoji");
                emoji.textContent = "🦥";

                const text = document.createElement("div");
                text.classList.add("empty-text");
                text.textContent = "Nothing Done!"

                emptySaver.appendChild(emoji);
                emptySaver.appendChild(text);

                todoList.appendChild(emptySaver);
            }
            else if (projectName == "ALL") {
                const todoList = document.querySelector('.todo-list');

                const emptySaver = document.createElement("div");
                emptySaver.classList.add("empty-saver");

                const emoji = document.createElement("div");
                emoji.classList.add("emoji");
                emoji.textContent = "🎊";

                const text = document.createElement("div");
                text.classList.add("empty-text");
                text.textContent = "No Todos! Create A Project And Add Todos!"

                emptySaver.appendChild(emoji);
                emptySaver.appendChild(text);

                todoList.appendChild(emptySaver);
            }
            else {
                const todoList = document.querySelector('.todo-list');

                const emptySaver = document.createElement("div");
                emptySaver.classList.add("empty-saver");

                const emoji = document.createElement("div");
                emoji.classList.add("emoji");
                emoji.textContent = "🎊";

                const text = document.createElement("div");
                text.classList.add("empty-text");
                text.textContent = "No Todos!"

                emptySaver.appendChild(emoji);
                emptySaver.appendChild(text);

                todoList.appendChild(emptySaver);
            }
        }
        else {
            Storage.getProjectList().getProject(projectName).getTodos().forEach((todo) => {
                createTodo(todo.title, todo.priority, todo.desc, todo.date, todo.done, todo.project);
            });
        }

    }

    function createTodo(title, priority, desc, date, done, project) {

        const todo = document.createElement('div');
        todo.classList.add('todo');    

        const check = document.createElement('div');
        check.classList.add("checkbox");

        check.style['border'] = `2px solid #${Storage.getProjectList().getProject(project).getColor()}90`;
        check.style['background-color'] = `#${Storage.getProjectList().getProject(project).getColor()}30`;


        // set Todo Done input configuration
        todo.onclick = (e) => {
            console.log('Todo clicked at:'+e.target);
            if (!e.target.classList.contains("edit-delete-popup-icon") 
            && !e.target.classList.contains("edit-delete-menu")
            && !e.target.classList.contains("option")
            && !e.target.classList.contains("editTodoIcon")
            && !e.target.classList.contains("deleteTodoIcon")
            && !e.target.classList.contains("editText")
            && !e.target.classList.contains("deleteText")
            ) {
                toggleDoneTodo(title, project);  
            }
        }

        const title_desc = document.createElement('div');
        title_desc.classList.add('title-desc');
        const title_tags = document.createElement('div');
        title_tags.classList.add('title-tags');

        const tags = document.createElement('div');
        tags.classList.add('tags');


        const titleText = document.createElement('div');
        titleText.classList.add('title');
        titleText.textContent = title;
        const priorityText = document.createElement('div');
        priorityText.classList.add('priority');
        priorityText.classList.add(priority.toLowerCase());
        priorityText.textContent = `${priority.charAt(0).toUpperCase() + priority.slice(1)} Priority`;

        // Add project name as tag
        const projectName = document.createElement('div');
        projectName.classList.add("priority");
        projectName.style['color'] = `#FFFFFF`;
        projectName.style['background-color'] = `#${Storage.getProjectList().getProject(project).getColor()}`;

        projectName.textContent = `#${project}`;

        title_tags.appendChild(titleText);
        title_tags.appendChild(tags);

        tags.appendChild(projectName);

        tags.appendChild(priorityText);
        

        const descText = document.createElement('div');
        descText.classList.add('desc');
        descText.textContent = desc;

        title_desc.appendChild(title_tags);
        title_desc.appendChild(descText);

        const date_time = document.createElement('div');
        date_time.classList.add('date-time');

        const dateFull = document.createElement('div');
        dateFull.classList.add('date');

            const dateIcon = document.createElement('i');
            dateIcon.classList.add("date-icon");

            const dateText = document.createElement('div');

        const timeFull = document.createElement('div');
        timeFull.classList.add('time');

            const timeIcon = document.createElement('i');
            timeIcon.classList.add("time-icon");

            const timeText = document.createElement('div');

        const today = new Date();
        if (isWithinInterval(date, {
            start: today,
            end: new Date(today.getFullYear(), today.getMonth(), today.getDate() + 7)
        })) {
            // 1. If task's date is due within a week
            dateText.textContent = formatDistanceToNow(date, { addSuffix: true });
            timeText.textContent = `${format(date, "p")}`;
        }
        else if (isPast(date)) {
            // 2. If overdue
            dateText.textContent = formatDistance(date, today, { addSuffix: true });
            timeText.textContent = "";
            timeIcon.style.display = 'none';

            if (done) dateIcon.style['background-color'] = 'rgba(0,0,0,0.7)';
            else dateIcon.style['background-color'] = 'rgba(157, 2, 8)';
        }
        else {
            // 3. Else
            dateText.textContent = format(date, "P");
            timeText.textContent = `${format(date, "p")}`;
        }

        dateFull.appendChild(dateIcon);
        dateFull.appendChild(dateText);
        timeFull.appendChild(timeIcon);
        timeFull.appendChild(timeText);

        date_time.appendChild(dateFull);
        date_time.appendChild(timeFull);

        const edit_delete = document.createElement('div');
        edit_delete.classList.add('edit-delete');

            const edit_delete_popup_i = document.createElement('i');
            edit_delete_popup_i.classList.add('edit-delete-popup-icon')

            // Hidden popup for edit-delete buttons
            const edit_delete_menu = document.createElement('div');
            edit_delete_menu.classList.add('edit-delete-menu');
            edit_delete_menu.classList.add('hidden');

                const view_option = document.createElement('div');
                    view_option.classList.add('option');

                        const view_option_i = document.createElement('i');
                        view_option_i.classList.add("viewTodoIcon");

                        const view_option_text = document.createElement('div');
                        view_option_text.classList.add("viewText");
                        view_option_text.textContent = "View Todo";
                    
                        view_option.appendChild(view_option_i); view_option.appendChild(view_option_text);

                    // Edit delete task configuration
                    view_option.onclick = (e) => {
                        viewTodo(title, project);
                        edit_delete_menu.classList.add('hidden');
                    }

                const edit_option = document.createElement('div');
                edit_option.classList.add('option');

                    const edit_option_i = document.createElement('i');
                    edit_option_i.classList.add("editTodoIcon");

                    const edit_option_text = document.createElement('div');
                    edit_option_text.classList.add("editText");
                    edit_option_text.textContent = "Edit Todo";
                
                    edit_option.appendChild(edit_option_i); edit_option.appendChild(edit_option_text);

                // Edit delete task configuration
                edit_option.onclick = (e) => {
                    editTodo(title, project);
                    edit_delete_menu.classList.add('hidden');
                }

                const delete_option = document.createElement('div');
                delete_option.classList.add('option');

                    const delete_option_i = document.createElement('i');
                    delete_option_i.classList.add("deleteTodoIcon");

                    const delete_option_text = document.createElement('div');
                    delete_option_text.classList.add("deleteText");
                    delete_option_text.textContent = "Delete Todo";
                
                    delete_option.appendChild(delete_option_i); 
                    delete_option.appendChild(delete_option_text);

                // Edit delete task configuration
                delete_option.onclick = (e) => {
                    deleteTodo(title, project);
                    edit_delete_menu.classList.add('hidden');
                }
            
            edit_delete_menu.appendChild(view_option);    
            edit_delete_menu.appendChild(edit_option);
            edit_delete_menu.appendChild(delete_option);
        
        edit_delete.appendChild(edit_delete_popup_i);
        edit_delete.appendChild(edit_delete_menu);

        edit_delete_popup_i.onclick = function openList(e) {
            // Hide all other popups
            const popups = document.querySelectorAll('.edit-delete-menu');
            popups.forEach((menu) => {
                menu.classList.add('hidden');
            })

            // show menu 
            if (edit_delete_menu.classList.contains("hidden")) {
                edit_delete_menu.classList.remove('hidden');
            }
            else {
                edit_delete_menu.classList.add('hidden');
            }

            window.onclick =  function closeList(e) {
                if (!e.target.classList.contains("edit-delete-popup-icon")// not the edit button itself
                && !e.target.classList.contains("option") 
                && !e.target.classList.contains("edit-delete-menu")) {
                    edit_delete_menu.classList.add('hidden');
                }
            };         
        }

        todo.appendChild(check);
        todo.appendChild(title_desc);
        todo.appendChild(date_time);
        todo.appendChild(edit_delete);

        // Check for conditions before appending todo into list
        if (isPast(date) && !done) {
            // IF OVERDUE
            todo.classList.add('overdue');

            const overdue = document.createElement('div');
            overdue.classList.add("priority");
            overdue.textContent = "! Overdue";
            overdue.style['color'] = `#FFFFFF`;
            overdue.style['background-color'] = `#000000`;

            tags.appendChild(overdue);
        }

        // If done - styling
        if (done) {
            todo.classList.add('done');

            const checkIcon = document.createElement("i");
            checkIcon.classList.add('checkIcon');

            check.appendChild(checkIcon);

            check.style['background-color'] = `#${Storage.getProjectList().getProject(project).getColor()}`;
        }
        else {
            todo.classList.remove('done');

            check.innerHTML = "";
        }

        // Append new div into todolist
        const todoList = document.querySelector('.todo-list');
        todoList.appendChild(todo);
    }

    function clearTodos() {
        const todoList = document.querySelector('.todo-list');
        todoList.innerHTML = "";
    }

    function resetActive() {
        const projectDivs = document.querySelectorAll('.project');
        projectDivs.forEach(project => {
            project.classList.remove("active");
        })
    }

    // Each project click event listeners and display selected content  
    function clickProjectSidebar() {
        const projectDivs = document.querySelectorAll('.project');
        const head = document.querySelector('.main-head');

        projectDivs.forEach((project) => {
            if (project.textContent == 'ALL') {
                project.onclick = function switchProject(e) {
                    head.innerHTML = ""; // Reset head
                    resetActive();
                    e.target.classList.add("active");

                    head.textContent = "All";
                    head.style.color = 'black';

                    clearTodos();
                    Storage.getProjectList().updateAll();
                    displayTodos('ALL');
                };
            }
            else if (project.textContent == 'TODAY') {
                project.onclick = function switchProject(e) {
                    head.innerHTML = ""; // Reset head
                    resetActive();
                    e.target.classList.add("active");

                    head.textContent = "Today";
                    head.style.color = 'black';

                    clearTodos();
                    Storage.getProjectList().updateToday();
                    displayTodos('TODAY');
                };
            }
            else if (project.textContent == 'THIS WEEK') {
                project.onclick = function switchProject(e) {
                    head.innerHTML = ""; // Reset head
                    resetActive();
                    e.target.classList.add("active");

                    head.textContent = "This Week";
                    head.style.color = 'black';

                    clearTodos();
                    Storage.getProjectList().updateThisWeek();
                    displayTodos('THIS WEEK');
                };
            }
            else if (project.textContent == 'DONE') {
                project.onclick = function switchProject(e) {
                    head.innerHTML = ""; // Reset head
                    resetActive();
                    e.target.classList.add("active");

                    head.textContent = "Done";
                    head.style.color = 'black';

                    clearTodos();
                    Storage.getProjectList().updateDone();
                    displayTodos('DONE');
                };
            }
            else {
                project.onclick = function switchProject(e) {
                    setActiveAndOpenProject(e.target.textContent.slice(2).toUpperCase());
                };
            }
        })
    }

    // Helper function to set active and open projectName  
    function setActiveAndOpenProject(projectName) {
        const head = document.querySelector('.main-head');
        const projectDivs = document.querySelectorAll('.project');

        head.innerHTML = ""; // Reset head

        // Reset Active and set projectName's project to be active
        resetActive();
        projectDivs.forEach((project) => {
            if (project.textContent.slice(2) == projectName) project.classList.add("active");
        });

        const intro = document.createElement('div');
        intro.innerHTML = "Project&nbsp";
        intro.style['font-style'] = "italic";
        intro.style['font-weight'] = "100";

        const sharp = document.createElement('span');
        sharp.innerHTML = "#&nbsp";

        const title = document.createElement('div');
        title.classList.add("head-title");

        sharp.style.color = `#${Storage.getProjectList().getProject(projectName.toUpperCase()).getColor()}`;
        title.style.color = `#${Storage.getProjectList().getProject(projectName.toUpperCase()).getColor()}`;

        title.textContent = projectName.toUpperCase();

        // New Todo Button Config
        const newTodoButton = document.createElement('button');
        newTodoButton.id = "new-todo";
        newTodoButton.textContent = `+ Add Todo`;

        newTodoButton.onclick = () => {
            newTodo(projectName.toUpperCase());
        };

        const edit_delete = document.createElement('div');
        edit_delete.classList.add('edit-delete');
        
            const edit_delete_popup_i = document.createElement('i');
            edit_delete_popup_i.classList.add('edit-delete-popup-icon');

            // Hidden popup for edit-delete buttons
            const edit_delete_menu = document.createElement('div');
            edit_delete_menu.classList.add('edit-delete-menu');
            edit_delete_menu.classList.add('hidden');

                const edit_option = document.createElement('div');
                edit_option.classList.add('option');

                    const edit_option_i = document.createElement('i');
                    edit_option_i.classList.add("editProjectIcon");

                    const edit_option_text = document.createElement('div');
                    edit_option_text.classList.add("editText");
                    edit_option_text.textContent = "Edit Project";
                
                    edit_option.appendChild(edit_option_i); edit_option.appendChild(edit_option_text);

                // Edit delete todo configuration
                edit_option.onclick = () => {
                    editProject(projectName.toUpperCase());
                    edit_delete_menu.classList.add('hidden');
                 };

                const delete_option = document.createElement('div');
                delete_option.classList.add('option');

                    const delete_option_i = document.createElement('i');
                    delete_option_i.classList.add("deleteProjectIcon");

                    const delete_option_text = document.createElement('div');
                    delete_option_text.classList.add("deleteText");
                    delete_option_text.textContent = "Delete Project";
                
                    delete_option.appendChild(delete_option_i); 
                    delete_option.appendChild(delete_option_text);

                // Edit delete task configuration
                delete_option.onclick = () => {
                    deleteProject(projectName.toUpperCase());
                    edit_delete_menu.classList.add('hidden');
                };
                
            edit_delete_menu.appendChild(edit_option);
            edit_delete_menu.appendChild(delete_option);
        
        edit_delete.appendChild(edit_delete_popup_i);
        edit_delete.appendChild(edit_delete_menu);

        edit_delete_popup_i.onclick = function openList(e) {
            // Hide all other popups
            const popups = document.querySelectorAll('.edit-delete-menu');
            popups.forEach((menu) => {
                menu.classList.add('hidden');
            })

            // show menu 
            if (edit_delete_menu.classList.contains("hidden")) {
                edit_delete_menu.classList.remove('hidden');
            }
            else {
                edit_delete_menu.classList.add('hidden');
            }

            window.onclick =  function closeList(e) {
                if (!e.target.classList.contains("edit-delete-popup-icon") // not the edit button itself
                && !e.target.classList.contains("option") 
                && !e.target.classList.contains("edit-delete-menu")) {
                    edit_delete_menu.classList.add('hidden');
                }
            };         
        }

        head.appendChild(intro);
        head.appendChild(sharp);
        head.appendChild(title);
        head.appendChild(newTodoButton);
        head.appendChild(edit_delete);


        clearTodos();
        displayTodos(projectName.toUpperCase());
    }

    // Add/Edit/Delete project functions
    function newProject() {;
        const button = document.querySelector("#new-project");
        button.setAttribute('title','Add New Project');

        const dialog = document.querySelector(".new-project-dialog");
        const colors = document.querySelectorAll(".color");

        const form = document.querySelector(".new-project-dialog-container");
        const name = document.querySelector("#project-name");

        const add = document.querySelector("#new-project-submit");
        const cancel = document.querySelector("#new-project-cancel");

        colors.forEach((color) => {
            const inner = document.createElement('div');
            inner.style['background-color'] = `#${color.id}`;
            inner.style['height'] = `30px`;
            inner.style['width'] = `30px`;
            inner.style['border-radius'] = '5px';

            color.appendChild(inner);
        });

        button.onclick = function newProjectPopup(e) {
            form.reset();
            dialog.showModal();

            const title = document.querySelector(".new-project-dialog-title");
            title.innerHTML = "Create New Project";

            // Unselected color
            colors.forEach((color) => {
                color.classList.remove('selected');
                color.style['outline'] = `1px solid rgba(51, 51, 51, 0.2)`;
            })

            // Select default color to first choice
            document.getElementById('f94144').classList.add('selected');
            document.getElementById('f94144').style['outline'] = '2px solid #f94144';


            // Color choose
            colors.forEach((color) => {
                color.onclick = function selectColor(e) {
                    colors.forEach((color) => {
                        color.classList.remove('selected');
                        color.style['outline'] = `1px solid rgba(51, 51, 51, 0.2)`;
                    })
                    color.classList.add('selected');
                    color.style['outline'] = `2px solid #${color.id}`;
                };
            })

            add.onclick = function adding(e) {
                e.preventDefault();
                if (name.value != "" && !Storage.getProjectList().projectExists(name.value)) {

                    // Storage - add new project
                    colors.forEach((color) => {
                        if (color.classList.contains("selected")) {
                            Storage.addProject(new Project(name.value.toUpperCase(), color.id));
                        }
                    })

                    dialog.close();

                    // Refresh projects and todos
                    refreshCurrentProjects();

                    // Open newly created project and set as active
                    setActiveAndOpenProject(name.value.toUpperCase());

                }
                else {
                    console.log("Invalid name")
                }
            };

            cancel.onclick = function cancelling(e) {
                e.preventDefault();
                dialog.close();
            };
        };
    }

    function editProject(projectName) {
        // Add project - popup
        const dialog = document.querySelector(".new-project-dialog");
        const colors = document.querySelectorAll(".color");

        const form = document.querySelector(".new-project-dialog-container");
        const name = document.querySelector("#project-name");

        const add = document.querySelector("#new-project-submit");
        const cancel = document.querySelector("#new-project-cancel");

        const originalColor = Storage.getProjectList().getProject(projectName).getColor();

        colors.forEach((color) => {
            color.innerHTML = ""; // Empty color div at each iteration
            const inner = document.createElement('div');
            inner.style['background-color'] = `#${color.id}`;
            inner.style['height'] = `30px`;
            inner.style['width'] = `30px`;
            inner.style['border-radius'] = '5px';

            color.appendChild(inner);
        });

        form.reset();
        dialog.showModal();

        const title = document.querySelector(".new-project-dialog-title");
        title.innerHTML = "Edit Project&nbsp";

        const sharp = document.createElement('span');
        sharp.innerHTML = `# ${projectName}`;
        sharp.style['color'] = `#${originalColor}`;
        sharp.style['font-weight'] = '600';
        
        title.appendChild(sharp);

        // Set name value to pre-selected name 
        name.value = projectName;

        // Unselect all colors
        colors.forEach((color) => {
            color.classList.remove('selected');
            color.style['outline'] = `1px solid rgba(51, 51, 51, 0.2)`;
        })
        // Select color value to pre-selected choice
        document.getElementById(originalColor).classList.add('selected');
        document.getElementById(originalColor).style['outline'] = `2px solid #${originalColor}`;

        // Color choose
        colors.forEach((color) => {
            color.onclick = function selectColor(e) {
                colors.forEach((color) => {
                    color.classList.remove('selected');
                    color.style['outline'] = `1px solid rgba(51, 51, 51, 0.2)`;
                })
                color.classList.add('selected');
                color.style['outline'] = `2px solid #${color.id}`;
            };
        })

        add.onclick = function adding(e) {
            e.preventDefault();
            if (name.value != "" && (name.value.toUpperCase() == projectName || !Storage.getProjectList().projectExists(name.value.toUpperCase()))) {
                // Storage - add new project
                colors.forEach((color) => {
                    if (color.classList.contains("selected")) {
                        Storage.changeColorProject(projectName, color.id);
                    }
                })

                Storage.renameProject(projectName, name.value.toUpperCase());

                dialog.close();

                // Refresh projects and todos
                refreshCurrentProjects();

                // Open newly created project and set as active
                setActiveAndOpenProject(name.value.toUpperCase());
            }
            else {
                console.log("Invalid name")
            }
        };

        cancel.onclick = function cancelling(e) {
            e.preventDefault();
            dialog.close();
        };
    }

    function deleteProject(projectName) {
        Storage.deleteProject(projectName); 
        
        refreshCurrentProjects(); // Refresh project sidebar + onclick events
        initDisplay(); // initialize display and active to 'All'
    }


    // Add/Edit/Delete Todo functions
    function newTodo(todoProject) {
        console.log("Add New Todo Running for: " , todoProject);

        const dialog = document.querySelector(".new-todo-dialog");
        const form = document.querySelector(".new-todo-dialog-container");
         
        form.reset();

        const priorities = document.querySelectorAll(".priority-radio");

        // Priority reset to low
        priorities.forEach((priority) => {
            priority.classList.remove('selected');
        });
        document.querySelector("#low").classList.add('selected');

        const title = document.querySelector('.new-todo-dialog-title')
        title.textContent = "Create New Todo";

        // Project - name
        const intro = document.querySelector('.intro');
        intro.style['font-weight'] = "300";
        intro.style['font-style'] = "italic";

        const sharp = document.querySelector('.sharp-name');
        sharp.innerHTML = `#&nbsp${todoProject}`;
        sharp.style.color = `#${Storage.getProjectList().getProject(todoProject).getColor()}`;
        sharp.style['font-weight'] = "600";

        // Set due date and time to current
        const dateinput = document.querySelector("#todo-date");
        const timeinput = document.querySelector("#todo-time");

        let today = new Date();
        let todayLater = new Date(today.getFullYear(), today.getMonth(), today.getDate(), today.getHours() + 1);

        dateinput.value = format(today, "yyyy-MM-dd");
        timeinput.value = format(todayLater, "HH:mm");

        // Priority choose
        priorities.forEach((priority) => {
            priority.addEventListener('click', (e) => {
                priorities.forEach((priority) => {
                    priority.classList.remove('selected');
                })
                priority.classList.add('selected');
            })
        });

        dialog.showModal();

        const titleinput = document.querySelector("#todo-title");
        const descinput = document.querySelector("#todo-desc");

        const add = document.querySelector("#new-todo-submit");
        add.textContent = "Add";
        const cancel = document.querySelector("#new-todo-cancel");

        add.onclick = function adding(e) {
            console.log("Clicked add");
            e.preventDefault();
            if (titleinput.value != "" && !Storage.getProjectList().getProject(todoProject).todoExists(titleinput.value)) {
                // If unique title - able to add

                // convert date, time inputs into Date object
                let dateString = `${dateinput.value}T${timeinput.value}`;

                // Find current selected priority
                let priorityinput = "low";
                priorities.forEach((priority) => {
                    if (priority.classList.contains('selected')) {
                        priorityinput = priority.id;
                    }
                })

                // Add to storage
                Storage.addTodo(todoProject, new Todo(titleinput.value, descinput.value, new Date(dateString), priorityinput, todoProject));
                dialog.close();

                // refresh current page's todos
                refreshCurrentTodos();
            }
            else {
                console.log("Invalid name - Cannot Add");
            }
        };

        cancel.onclick = function cancelling(e) {
            e.preventDefault();
            dialog.close();
        };
    }


    // Edit task - popup
    function editTodo(todoTitle, todoProject) {
        console.log("edit tab opened", todoTitle, todoProject);
        const dialog = document.querySelector(".new-todo-dialog");
        const form = document.querySelector(".new-todo-dialog-container");

        form.reset();

        const priorities = document.querySelectorAll(".priority-radio");

        // Priority automatically set to its pre-set state
        priorities.forEach((priority) => {
            priority.classList.remove('selected');
        });
        document.getElementById(Storage.getProjectList().getProject(todoProject).getTodo(todoTitle).getPriority()).classList.add('selected');

        // Project - name
        const title = document.querySelector('.new-todo-dialog-title')
        title.textContent = "Edit Todo";

        const intro = document.querySelector('.intro');
        intro.style['font-weight'] = "300";
        intro.style['font-style'] = "italic";

        const sharp = document.querySelector('.sharp-name');
        sharp.innerHTML = `#&nbsp${todoProject}`;
        sharp.style.color = `#${Storage.getProjectList().getProject(todoProject).getColor()}`;
        sharp.style['font-weight'] = "600";

        // Set title to current
        const titleinput = document.querySelector("#todo-title");
        titleinput.value = Storage.getProjectList().getProject(todoProject).getTodo(todoTitle).getTitle();

        // Set desc to current
        const descinput = document.querySelector("#todo-desc");
        descinput.value = Storage.getProjectList().getProject(todoProject).getTodo(todoTitle).getDesc();

        // Set due date and time to current
        const dateinput = document.querySelector("#todo-date");
        const timeinput = document.querySelector("#todo-time");

        dateinput.value = format(Storage.getProjectList().getProject(todoProject).getTodo(todoTitle).getDate(), "yyyy-MM-dd");
        timeinput.value = format(Storage.getProjectList().getProject(todoProject).getTodo(todoTitle).getDate(), "HH:mm");

        dialog.showModal();

        // Priority choose
        priorities.forEach((priority) => {
            priority.addEventListener('click', (e) => {
                priorities.forEach((priority) => {
                    priority.classList.remove('selected');
                })
                priority.classList.add('selected');
            })
        });

        // Edit submit/cancel
        const edit = document.querySelector("#new-todo-submit");
        edit.textContent = "Edit";

        const cancel = document.querySelector("#new-todo-cancel");

        edit.onclick = function editing(e) {
            e.preventDefault();
            if (titleinput.value != "" && // If title input is not empty & (either no change or new title doesn't already exist in the project) 
                (todoTitle == titleinput.value || !Storage.getProjectList().getProject(todoProject).todoExists(titleinput.value))) {
                // If unique edited title - able to add
                // convert date, time inputs into Date object
                let dateString = `${dateinput.value}T${timeinput.value}`;

                // Find current selected priority
                let priorityinput;
                priorities.forEach((priority) => {
                    if (priority.classList.contains('selected')) {
                        priorityinput = priority.id;
                    }
                })

                // Edit storage - change name last (as name functions as index)
                Storage.changeDescTodo(todoProject, todoTitle, descinput.value);
                Storage.changeDateTodo(todoProject, todoTitle, new Date(dateString));
                Storage.changePriorityTodo(todoProject, todoTitle, priorityinput);
                Storage.renameTodo(todoProject, todoTitle, titleinput.value);

                dialog.close();

                // refresh current page's todos
                refreshCurrentTodos();
            }
            else {
                console.log("Invalid name / Already exists");
            }
        };

        cancel.onclick = function cancelling(e) {
            e.preventDefault();
            dialog.close();
        };
    };

    function deleteTodo(todoTitle, todoProject) {
        Storage.deleteTodo(todoProject, todoTitle);
         // refresh current page's todos 
        refreshCurrentTodos();
    };

    function viewTodo(todoTitle, todoProject) {
        console.log("view tab opened", todoTitle, todoProject);
        const dialog = document.querySelector(".view-todo-dialog");
        const container = document.querySelector(".view-todo-dialog-container");

        // Project - name
        const title = document.querySelector('.view-title');
        const span = document.querySelector('.view-title-intro');
        span.style.color = `#${Storage.getProjectList().getProject(todoProject).getColor()}`;
        title.textContent = `${Storage.getProjectList().getProject(todoProject).getTodo(todoTitle).getTitle()}`;

        const title_tags = document.querySelector('.view-title-tags');
        title_tags.innerHTML = ""; //reset

        const date = Storage.getProjectList().getProject(todoProject).getTodo(todoTitle).getDate()
        const done = Storage.getProjectList().getProject(todoProject).getTodo(todoTitle).getDone();

        const currentPriority = Storage.getProjectList().getProject(todoProject).getTodo(todoTitle).getPriority();

        const priorityText = document.createElement('div');
        priorityText.classList.add('priority');
        priorityText.classList.add('view-only');
        priorityText.classList.add(currentPriority.toLowerCase());
        priorityText.textContent = `${currentPriority.charAt(0).toUpperCase() + currentPriority.slice(1)} Priority`;

        // Add project name as tag
        const projectName = document.createElement('div');
        projectName.classList.add("priority");
        projectName.classList.add('view-only');
        projectName.style['color'] = `#FFFFFF`;
        projectName.style['background-color'] = `#${Storage.getProjectList().getProject(todoProject).getColor()}`;

        projectName.textContent = `#${todoProject}`;

        title_tags.appendChild(projectName);
        title_tags.appendChild(priorityText);

        // Set desc to current
        const desc = document.querySelector(".view-desc-text");
        if (Storage.getProjectList().getProject(todoProject).getTodo(todoTitle).getDesc() == "") {
            desc.textContent = `No Description`
        }
        else {
            desc.textContent = `${Storage.getProjectList().getProject(todoProject).getTodo(todoTitle).getDesc()}`;
        }  

        // Set due date and time to current
        const distance = document.querySelector(".view-distance");
        distance.style['color'] = 'black';
        distance.textContent = `Due ${formatDistanceToNow(date, { addSuffix: true })}`;

        const dateText = document.querySelector('.view-date-text');
        dateText.textContent = format(date, "P");

        const timeText = document.querySelector('.view-time-text');
        timeText.textContent = `${format(date, "p")}`;

        // If done - styling
        if (done) {
            distance.textContent = "Todo Completed!";
            container.classList.add('done');
        }
        else {
            container.classList.remove('done');
        }

        // Check for conditions before appending todo into list
        if (isPast(date) && !done) {
            // IF OVERDUE
            container.classList.add('overdue');

            const overdue = document.createElement('div');
            overdue.classList.add("priority");
            overdue.classList.add('view-only');
            overdue.textContent = "! Overdue";
            overdue.style['color'] = `#FFFFFF`;
            overdue.style['background-color'] = `#000000`;

            distance.style['color'] = 'rgba(157, 2, 8)'

            title_tags.appendChild(overdue);
        };

        dialog.showModal();

        // Edit submit/cancel

        const cancel = document.querySelector("#view-cancel");

        cancel.onclick = function cancelling(e) {
            e.preventDefault();
            dialog.close();
        };
    }

    // Toggle task as done - visual check + add to "Done" project
    function toggleDoneTodo(todoTitle, todoProject) {
        if (!Storage.getProjectList().getProject(todoProject).getTodo(todoTitle).getDone()) {
            // Toggle to 'done'
            Storage.changeDoneTodo(todoProject, todoTitle, true);
            refreshCurrentTodos();
        }
        else {
            // Toggle to 'not done'
            Storage.changeDoneTodo(todoProject, todoTitle, false);
            refreshCurrentTodos();
        }
    }

    return {
        refreshCurrentProjects,
        refreshCurrentTodos,
        initDisplay,
        initSidebar,

        displaySidebarProjects,
        createProject,

        displayTodos,
        createTodo,

        clearTodos,
        resetActive,
        clickProjectSidebar,
        setActiveAndOpenProject,

        newProject,
        editProject,
        deleteProject,

        newTodo,
        editTodo,
        deleteTodo,
        viewTodo,

        toggleDoneTodo
    }
})();

export default UI;