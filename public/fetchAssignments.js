
// import 'dotenv/config';
// require("dotenv").config();
// const ical = require('node-ical');
    const API_URL = "https://cmu.instructure.com/api/v1/";
    const ACCESS_TOKEN = process.env.CANVAS_API_TOKEN; 
    const CANVAS_ID = process.env.CANVAS_ID;
    const assignmentsFile = "./assignments.txt";
    // const fs = require('fs');
    const today = new Date();
    const currentYear = today.getFullYear();
    const currentMonth = today.getMonth() + 1;
    const currentDay = today.getDate();
    const events = [];
// const { callbackify } = require("util");

    export async function fetchAssignments() {
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

            // if(response != null && response.calendar != null && response.calendar.ics != null)
            //     {
            //         if(response.access_restricted_by_date == false)
            //         {
            //             var calendarUrl = response.calendar.ics;
            //             // console.log("\n\ncourse=\n",course);
            //             // calendarUrl = 'https://canvas.cmu.edu/feeds/calendars/course_bjEypfSuoIeIxseRuBkI66x6qO1VlLxLrKONBLRy.ics';
            //             fetchAndParseICS(calendarUrl);
            //         }

            //     }

            // console.log("response=" , response);
            const courses = await response.json();
            // console.log("courses=",courses);
            for (let course of courses) {
                // console.log("\n\ncourse=\n",course);
                try{
                    if(course != null && course.calendar != null && course.calendar.ics != null)
                        {
                            // if(course.access_restricted_by_date == false)
                            // {
                                var calendarUrl = course.calendar.ics;
                                // console.log("\n\ncourse=\n",course);
                                // calendarUrl = 'https://canvas.cmu.edu/feeds/calendars/course_bjEypfSuoIeIxseRuBkI66x6qO1VlLxLrKONBLRy.ics';
                                fetchAndParseICS(calendarUrl,course.name,course.id);
                            // }

                        }
                }
                catch
                {
                    console.log("course unavailable");
                }
                const assignmentsResponse = await fetch(`${API_URL}/users/${CANVAS_ID}/courses/${course.id}/assignments?access_token=${ACCESS_TOKEN}`, {
                    headers: {
                        // "Authorization": `Bearer ${ACCESS_TOKEN}`,
                        "Content-Type" : "application/json"
                    }
                });
                saveEventsToFile(events);
                const assignments = await assignmentsResponse.json();
                // console.log("assignments=",assignments);
                // displayAssignments(course.name, assignments);
                
            }
        } catch (error) {
            console.error("Error fetching assignments:", error);
        }
    }

    function displayAssignments(courseName, assignments) {
        // const assignmentsContainer = document.querySelector(".assignments");
        // console.log(assignments);
        // assignments.forEach(assignment => {
        //     fs.writeFile(assignmentsFile,assignment,'utf8',(err)=>{
        //         if(err)
        //         {
        //             console.log("Error writing to file",err);
        //         }
        //     })
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

    async function findCalendar (calendarUrl)  {
        // load and parse this file without blocking the event loop
        // const events = await ical.async.parseFile('example-calendar.ics');
    
        // you can also use the async lib to download and parse iCal from the web
        const webEvents = await ical.async.fromURL(calendarUrl);
        // also you can pass options to axios.get() (optional though!)
        const headerWebEvents = await ical.async.fromURL(
            calendarUrl,
            { headers: { 'User-Agent': 'API-Example / 1.0' } }
        );
        
        // console.log(headerWebEvents);
    
        // parse iCal data without blocking the main loop for extra-large events
        // const directEvents = await ical.async.parseICS(`
        // BEGIN:VCALENDAR
        // VERSION:2.0
        // CALSCALE:GREGORIAN
        // BEGIN:VEVENT
        // SUMMARY:Hey look! An example event!
        // DTSTART;TZID=America/New_York:20130802T103400
        // DTEND;TZID=America/New_York:20130802T110400
        // DESCRIPTION: Do something in NY.
        // UID:7014-1567468800-1567555199@peterbraden@peterbraden.co.uk
        // END:VEVENT
        // END:VCALENDAR
        // `);
    }

    async function fetchAndParseICS(url,coursename,courseId) {
        try {
            const response = await fetch(url);
            const text = await response.text();
    
            
            const eventBlocks = text.split("BEGIN:VEVENT").slice(1); // Split events
            // console.log("\n\ncalendar response =\n",response);
            for (let block of eventBlocks) {
                // console.log("\n\ncalendar block= \n",block);
                let event = {};
                event.courseId = courseId;
                event.summary = block.match(/SUMMARY:(.+)/)?.[1].slice(0,-7) || "No Summary";
                event.start = block.match(/DTSTART(?:;[^:]+)?:([0-9T]+)/)?.[1] || "No Start Date";
                event.end = block.match(/DTEND(?:;[^:]+)?:([0-9T]+)/)?.[1] || "No End Date";
                event.location = block.match(/LOCATION:(.+)/)?.[1] || "No Location";
                event.description = block.match(/DESCRIPTION:(.+)/)?.[1] || "No Description";
                event.coursename = coursename;
                event.url = `https://canvas.cmu.edu/courses/${courseId}/assignments`;
                
                
                // console.log("\n\ncalendar event= \n",event);
                var date = parseDate(event.end);
                // console.log("")
                
                if(!datePassed(date))
                {
                    event.duedate = date;
                    events.push(event);
                    console.log(`${date.month}, ${date.day}, ${date.year}`);    
                }
            }
    
            // console.log(events);
            // saveEventsToFile(events);
            return events;
        } catch (error) {
            console.error("Error fetching or parsing ICS file:", error);
        }
    }
    
    function datePassed(date)
    {
        if(date.year != currentYear) return true;
        if(date.monthNum < currentMonth) return true;
        if(date.day < currentDay) return true;
        return false;
    }

    function parseDate(datestring)
    {
        months = ["January","Feburary","March","April","May","June","July","August","September","October","November","December"]
        date = {};
        try
        {
            var year = Number(datestring.slice(0,4));
            var monthNum = Number(datestring.slice(4,6));
            var month = months[monthNum - 1];
            var day = Number(datestring.slice(6,8));
            date.year = year;
            date.month = month;
            date.day = day;
            date.monthNum = monthNum;
            return date;

        }
        catch
        {
            console.log("date parse failed");
            return null;
        }
    }


    function saveEventsToFile(events, filename = "./public/assignments.json") {
        // try {
            const jsonData = JSON.stringify(events, null, 2); // Pretty-print JSON
    //         fs.writeFileSync(filename, jsonData, "utf8"); // Write to file
    //         console.log(`JSON file saved as ${filename}`);
    //     } catch (error) {
    //         console.error("Error writing JSON file:", error);
    //     }
    // }
    // fetchAssignments();
    // document.addEventListener("DOMContentLoaded", fetchAssignments);
