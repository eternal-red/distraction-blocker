document.addEventListener("DOMContentLoaded", async function () {
    try {
        // Fetch JSON file
        const response = await fetch("assignments.json");
        const events = await response.json();

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
            assignmentContainer.appendChild(newAssignment);
        });

        // Add to-do list dynamically
        // events.slice(3, 6).forEach(event => {
        //     const newTask = todoTemplate.cloneNode(true);
        //     newTask.style.display = "flex";
        //     newTask.removeAttribute("data-template");
        //     const link = newTask.querySelector("a");
        //     link.href = event.url || "#";
        //     newTask.querySelector("h3").textContent = event.summary;
        //     newTask.querySelector(".due-date").textContent = `Due: ${event.duedate.month} ${event.duedate.day}, ${event.duedate.year}`;
        //     todoContainer.appendChild(newTask);
        // });

    } catch (error) {
        console.error("Error loading assignments:", error);
    }
});
