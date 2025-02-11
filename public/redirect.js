
// import 'dotenv/config';
require("dotenv").config();
    const API_URL = "https://cmu.instructure.com/api/v1/";
    const ACCESS_TOKEN = process.env.CANVAS_API_TOKEN; 
    const CANVAS_ID = process.env.CANVAS_ID;
    const assignmentsFile = "./assignments.txt";
    const fs = require('fs');

    async function fetchAssignments() {
        try {
            // const response = await fetch(`${API_URL}/courses?per_page=10`, {
            //     headers: {
            //         "Authorization": `Bearer ${ACCESS_TOKEN}`,
            //         "Content-Type" : 'application/json'
            //     }
            // });
            const response = await fetch(`${API_URL}/courses?per_page=100&access_token=${ACCESS_TOKEN}`, {
                headers: {
                    // "Authorization": `Bearer ${ACCESS_TOKEN}`,
                    "Content-Type" : 'application/json'
                }
            });

            console.log("response=" , response);
            const courses = await response.json();
            console.log("courses=",courses);
            for (let course of courses) {
                const assignmentsResponse = await fetch(`${API_URL}/users/${CANVAS_ID}/courses/${course.id}/assignments?access_token=${ACCESS_TOKEN}`, {
                    headers: {
                        // "Authorization": `Bearer ${ACCESS_TOKEN}`,
                        "Content-Type" : "application/json"
                    }
                });

                const assignments = await assignmentsResponse.json();
                console.log("assignments=",assignments);
                displayAssignments(course.name, assignments);
            }
        } catch (error) {
            console.error("Error fetching assignments:", error);
        }
    }

    function displayAssignments(courseName, assignments) {
        // const assignmentsContainer = document.querySelector(".assignments");
        // console.log(assignments);
        assignments.forEach(assignment => {
            fs.writeFile(assignmentsFile,assignment,'utf8',(err)=>{
                if(err)
                {
                    console.log("Error writing to file",err);
                }
            })
            // const assignmentDiv = document.createElement("div");
            // assignmentDiv.classList.add("assignment", "blue"); // Use class to match styling
            // assignmentDiv.innerHTML = `
            //     <p class="class-name">${courseName}</p>
            //     <h3>${assignment.name}</h3>
            //     <p class="due-date">Due: ${new Date(assignment.due_at).toLocaleDateString()}</p>
            // `;
            // assignmentsContainer.appendChild(assignmentDiv);

        });
    }

    fetchAssignments();
    // document.addEventListener("DOMContentLoaded", fetchAssignments);
