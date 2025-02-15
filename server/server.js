// Import necessary modules
import express from 'express';
import { fetchAssignments } from './fetchAssignments.js';

const app = express();
const port =  5000; // Default port or port from environment

// Define a route for fetching assignments
app.get('/assignments', async (req, res) => {
    try {
        const assignments = await fetchAssignments(); // Get the data from your async function
        res.json(assignments); // Respond with the data as JSON
    } catch (error) {
        res.status(500).json({ error: 'Error fetching assignments' });
    }
});

// Start the server
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
