const express = require("express");

const app = express();
const PORT = process.env.PORT || 3000;

app.use((req, res, next) => {
    res.on("finish", () => {
        console.log(`[${req.method}] ${req.originalUrl} - Status: ${res.statusCode}`);
    });
    next();
});

app.get("/", (req, res) => {
    res.status(200).send("Welcome to my Node.js and Express server!");
});

app.get("/about", (req, res) => {
    res.status(200).json({
        name: "Sasidhar Reddy",
        section: "AIDE-313-2B"
    });
});

app.get("/time", (req, res) => {
    res.status(200).json({
        currentDateTime: new Date()
    });
});

app.use((req, res) => {
    res.status(404).send("404 - Page Not Found");
});

app.listen(PORT, () => {
    console.log(`Express server running at http://localhost:${PORT}`);
});
