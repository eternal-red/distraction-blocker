
// import 'dotenv/config';
// require("dotenv").config();
    const API_URL = "https://your-school.instructure.com/api/v1";
    const ACCESS_TOKEN = import.meta.env.CANVAS_API_TOKEN; 

    async function fetchAssignments() {
        try {
            const response = await fetch(`${API_URL}/courses?per_page=10`, {
                headers: {
                    "Authorization": `Bearer ${ACCESS_TOKEN}`
                }
            });

            const courses = await response.json();

            for (let course of courses) {
                const assignmentsResponse = await fetch(`${API_URL}/courses/${course.id}/assignments`, {
                    headers: {
                        "Authorization": `Bearer ${ACCESS_TOKEN}`
                    }
                });

                const assignments = await assignmentsResponse.json();
                displayAssignments(course.name, assignments);
            }
        } catch (error) {
            console.error("Error fetching assignments:", error);
        }
    }

    function displayAssignments(courseName, assignments) {
        const assignmentsContainer = document.querySelector(".assignments");
        
        assignments.forEach(assignment => {
            const assignmentDiv = document.createElement("div");
            assignmentDiv.classList.add("assignment", "blue"); // Use class to match styling
            assignmentDiv.innerHTML = `
                <p class="class-name">${courseName}</p>
                <h3>${assignment.name}</h3>
                <p class="due-date">Due: ${new Date(assignment.due_at).toLocaleDateString()}</p>
            `;
            assignmentsContainer.appendChild(assignmentDiv);
        });
    }

    document.addEventListener("DOMContentLoaded", fetchAssignments);
