const express = require("express");

const app = express();
const PORT = process.env.PORT || 3000;

// Logging middleware to log route access and status code (Task 7)
app.use((req, res, next) => {
    res.on("finish", () => {
        console.log(`[${req.method}] ${req.originalUrl} - Status: ${res.statusCode}`);
    });
    next();
});

// Task 5: GET / (welcome text)
app.get("/", (req, res) => {
    res.status(200).send("Welcome to my Node.js and Express server!");
});

// Task 5: GET /about (JSON with name and section)
app.get("/about", (req, res) => {
    res.status(200).json({
        name: "Sasidhar Reddy",
        section: "AIDE-313-2B"
    });
});

// Task 5: GET /time (current date and time using new Date())
app.get("/time", (req, res) => {
    res.status(200).json({
        currentDateTime: new Date()
    });
});

// Task 6: Return a 404 message for any unknown path
app.use((req, res) => {
    res.status(404).send("404 - Page Not Found");
});

// Task 4: Rewrite it with Express: const app = express() and app.listen(3000)
app.listen(PORT, () => {
    console.log(`Express server running at http://localhost:${PORT}`);
});
