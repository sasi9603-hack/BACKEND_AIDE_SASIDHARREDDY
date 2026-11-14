const express = require("express");
const path = require("path");
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const app = express();

// Task 1: Add app.use(express.json()) so the request body can be parsed as JSON
app.use(express.json());

// Task 5: Constant secret key for signing JWT tokens (moved to .env in Lab 8)
const JWT_SECRET = "AURORA_MERN_JWT_SECRET_KEY_2026";

const dbPath = path.join(__dirname, "userData.db");
let db = null;

// Initialize SQLite database and Express server
const initializeDBAndServer = async () => {
    try {
        db = await open({
            filename: dbPath,
            driver: sqlite3.Database,
        });

        // Task 2: Ensure user table exists with unique username, name, and hashed password column
        await db.run(`
            CREATE TABLE IF NOT EXISTS user (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                username TEXT UNIQUE NOT NULL,
                name TEXT NOT NULL,
                password TEXT NOT NULL,
                gender TEXT,
                location TEXT
            );
        `);

        const PORT = process.env.PORT || 3000;
        const server = app.listen(PORT, () => {
            console.log(`Server Running at http://localhost:${PORT}/`);
        });
        return server;
    } catch (error) {
        console.error(`DB Initialization Error: ${error.message}`);
        process.exit(1);
    }
};

// Start server when executed directly
if (require.main === module) {
    initializeDBAndServer();
}

/**
 * Root Route: GET /
 * Provides API directory, student information, and available endpoints
 */
app.get("/", (request, response) => {
    response.status(200).json({
        module: "Lab 4: Registration, login and JWT",
        author: "V. Sasidhar Reddy",
        registrationNumber: "252U1R5130",
        section: "AIDE - 2B & 313",
        course: "Backend Development Fundamentals",
        endpoints: {
            register: "POST /register/ (Body: { username, name, password, gender?, location? })",
            login: "POST /login/ (Body: { username, password })",
            users: "GET /users/ (Inspect database records - stores hashes only)",
            decodeToken: "POST /decode-token/ (Body: { jwt_token })",
        },
        securityNotes: {
            passwordStorage: "Passwords are never stored in plain text; hashed with bcrypt (salt rounds = 10)",
            tokenPayload: "Payload includes only username, never passwords or sensitive credentials",
            queries: "All database queries use parameterized SQL inputs to prevent SQL injection",
        },
    });
});

/**
 * Task 3: POST /register/ (also handles /register)
 * Reject an existing username with 400; otherwise hash the password with bcrypt.hash and save the user.
 */
const handleRegister = async (request, response) => {
    try {
        const { username, name, password, gender = null, location = null } = request.body;

        // Input validation: ensure required fields are present
        if (!username || !name || !password) {
            return response.status(400).send("Missing required fields: username, name, and password are required");
        }

        // Parameterized query to check if username already exists
        const selectUserQuery = `SELECT * FROM user WHERE username = ?;`;
        const existingUser = await db.get(selectUserQuery, [username]);

        if (existingUser !== undefined) {
            // Reject duplicate username with HTTP 400
            return response.status(400).send("User already exists");
        }

        // Hash password with bcrypt using 10 salt rounds
        const hashedPassword = await bcrypt.hash(password, 10);

        // Parameterized query to insert the new user record with hashed password
        const createUserQuery = `
            INSERT INTO user (username, name, password, gender, location)
            VALUES (?, ?, ?, ?, ?);
        `;
        await db.run(createUserQuery, [username, name, hashedPassword, gender, location]);

        // Success response
        return response.status(200).send("User created successfully");
    } catch (error) {
        console.error("Register Error:", error.message);
        return response.status(500).json({ error: "Internal Server Error" });
    }
};

app.post("/register/", handleRegister);
app.post("/register", handleRegister);

/**
 * Task 4 & 5: POST /login/ (also handles /login)
 * Return 400 for unknown user, compare password with bcrypt.compare, return 400 for wrong password,
 * and on success return { jwt_token } created with jwt.sign containing ONLY username in payload.
 */
const handleLogin = async (request, response) => {
    try {
        const { username, password } = request.body;

        // Input validation: ensure username and password provided
        if (!username || !password) {
            return response.status(400).send("Missing required fields: username and password are required");
        }

        // Parameterized query to find user by username
        const selectUserQuery = `SELECT * FROM user WHERE username = ?;`;
        const dbUser = await db.get(selectUserQuery, [username]);

        if (dbUser === undefined) {
            // Return 400 for unknown user
            return response.status(400).send("Invalid user");
        }

        // Compare plain password against bcrypt hash in database
        const isPasswordMatched = await bcrypt.compare(password, dbUser.password);

        if (!isPasswordMatched) {
            // Return 400 for wrong password
            return response.status(400).send("Invalid password");
        }

        // Task 5: Put ONLY the username (never password) in payload, sign with JWT_SECRET
        const payload = {
            username: dbUser.username,
        };

        const jwt_token = jwt.sign(payload, JWT_SECRET, { expiresIn: "30d" });

        // On success return { jwt_token }
        return response.status(200).json({ jwt_token });
    } catch (error) {
        console.error("Login Error:", error.message);
        return response.status(500).json({ error: "Internal Server Error" });
    }
};

app.post("/login/", handleLogin);
app.post("/login", handleLogin);

/**
 * Verification Route: GET /users/ (also handles /users)
 * Demonstrates that the database stores bcrypt hashes only and never plain-text passwords
 */
const handleGetUsers = async (request, response) => {
    try {
        const getUsersQuery = `
            SELECT id, username, name, password, gender, location
            FROM user
            ORDER BY id ASC;
        `;
        const users = await db.all(getUsersQuery);
        return response.status(200).json(users);
    } catch (error) {
        return response.status(500).json({ error: error.message });
    }
};

app.get("/users/", handleGetUsers);
app.get("/users", handleGetUsers);

/**
 * Task 6 Support: POST /decode-token/
 * Demonstrates decoding of JWT tokens to inspect Header, Payload, and Signature structure
 */
app.post("/decode-token/", (request, response) => {
    try {
        const { jwt_token } = request.body;
        if (!jwt_token) {
            return response.status(400).json({ error: "Missing jwt_token in request body" });
        }

        const decodedComplete = jwt.decode(jwt_token, { complete: true });
        if (!decodedComplete) {
            return response.status(400).json({ error: "Invalid token format" });
        }

        // Verify validity with JWT_SECRET
        let isSignatureValid = false;
        try {
            jwt.verify(jwt_token, JWT_SECRET);
            isSignatureValid = true;
        } catch (verifyErr) {
            isSignatureValid = false;
        }

        return response.status(200).json({
            header: decodedComplete.header,
            payload: decodedComplete.payload,
            signatureValid: isSignatureValid,
            notes: "Verified: Payload contains only username, never password.",
        });
    } catch (error) {
        return response.status(500).json({ error: error.message });
    }
});

// Catch-all for undefined routes
app.use((request, response) => {
    response.status(404).json({ error: "404 - Route Not Found" });
});

module.exports = { app, initializeDBAndServer, JWT_SECRET };
