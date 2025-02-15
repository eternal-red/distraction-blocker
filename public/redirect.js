document.addEventListener("DOMContentLoaded", async function () {
    try {
        // Fetch JSON file
        const colorClasses = ["blue", "red", "green", "yellow", "orange", "pink", "purple", "teal", "cyan", "lime"];
        const colorLength = colorClasses.length;
        // const response = await fetch("assignments.json");
        const response = await fetch("http://localhost:3000/assignments"); // Backend endpoint
        // const events = await response.json();
        const events = await response.json();

        const addTaskBtn = document.getElementById("add-task-btn");
        const taskInput = document.getElementById("task-input");
        const todoList = document.querySelector(".todo-list");

        // Load tasks from localStorage
        function loadTasks() {
            const tasksJSON = localStorage.getItem("tasks");
            const tasks = tasksJSON ? JSON.parse(tasksJSON) : []; // If no tasks, use empty array
            todoList.innerHTML = ""; // Clear existing list before loading

            tasks.forEach((task, index) => {
                const taskElement = document.createElement("div");
                taskElement.classList.add("task");

                // Checkbox
                const checkbox = document.createElement("input");
                checkbox.type = "checkbox";
                checkbox.checked = task.completed;
                checkbox.addEventListener("change", () => toggleTaskCompletion(index));

                // Task content
                const taskContent = document.createElement("div");
                taskContent.classList.add("task-content");

                const taskName = document.createElement("h3");
                taskName.textContent = task.name;

                // Delete button
                const deleteBtn = document.createElement("button");
                deleteBtn.textContent = "❌";
                deleteBtn.addEventListener("click", () => deleteTask(index));

                // Append elements
                taskContent.appendChild(taskName);
                taskElement.appendChild(checkbox);
                taskElement.appendChild(taskContent);
                taskElement.appendChild(deleteBtn);
                todoList.appendChild(taskElement);
            });
        }

        // Toggle task completion
        function toggleTaskCompletion(index) {
            const tasksJSON = localStorage.getItem("tasks");
            const tasks = tasksJSON ? JSON.parse(tasksJSON) : [];
            tasks[index].completed = !tasks[index].completed;
            localStorage.setItem("tasks", JSON.stringify(tasks));
            loadTasks(); // Re-load tasks to reflect changes
        }

        // Delete task
        function deleteTask(index) {
            const tasksJSON = localStorage.getItem("tasks");
            const tasks = tasksJSON ? JSON.parse(tasksJSON) : [];
            tasks.splice(index, 1); // Remove task at specified index
            localStorage.setItem("tasks", JSON.stringify(tasks));
            loadTasks(); // Re-load tasks to reflect changes
        }

        // Handle adding new task
        addTaskBtn.addEventListener("click", function () {
            const taskName = taskInput.value.trim();
            taskInput.value = ""; // Clear input field

            if (!taskName) return; // Don't add empty tasks

            let newTask = { name: taskName, completed: false };

            // Get existing tasks from localStorage
            const tasksJSON = localStorage.getItem("tasks");
            const tasks = tasksJSON ? JSON.parse(tasksJSON) : [];

            // Add new task
            tasks.push(newTask);

            // Save updated tasks back to localStorage
            localStorage.setItem("tasks", JSON.stringify(tasks));

            console.log("Task added:", newTask);
            loadTasks(); // Re-load tasks to reflect changes
        });

        // Sort events by due date (earliest first)
        events.sort((a, b) => {
            const dateA = new Date(a.duedate.year, a.duedate.monthNum - 1, a.duedate.day).getTime();
            const dateB = new Date(b.duedate.year, b.duedate.monthNum - 1, b.duedate.day).getTime();
            return dateA - dateB; // Earliest due date first
        });

        // Select templates
        const assignmentTemplate = document.querySelector(".assignments .assignment[data-template]");
        const todoTemplate = document.querySelector(".todo-list .task[data-template]");
        const assignmentContainer = document.querySelector(".assignments");
        const todoContainer = document.querySelector(".todo-list");

        // Add assignments dynamically
        events.forEach(event => {
            const newAssignment = assignmentTemplate.cloneNode(true);
            newAssignment.style.display = "block";
            newAssignment.removeAttribute("data-template");
            const link = newAssignment.querySelector("a");
            link.href = event.url || "#";
            newAssignment.querySelector(".class-name").textContent = event.coursename;
            newAssignment.querySelector("h3").textContent = event.summary;
            newAssignment.querySelector(".due-date").textContent = `Due: ${event.duedate.month} ${event.duedate.day}, ${event.duedate.year}`;
            const currentColorClass = colorClasses[event.courseId % colorLength];
            newAssignment.classList.add(currentColorClass);

            assignmentContainer.appendChild(newAssignment);
        });

        loadTasks(); // Load tasks when page is ready
    } catch (error) {
        console.error("Error loading assignments:", error);
    }
});
