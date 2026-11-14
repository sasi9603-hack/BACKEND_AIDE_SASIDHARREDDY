const http = require("http");
const { app, initializeDBAndServer, JWT_SECRET } = require("./app");
const jwt = require("jsonwebtoken");

const PORT = 3008;
let server;

function request(options, data) {
    return new Promise((resolve, reject) => {
        const req = http.request(options, (res) => {
            let body = "";
            res.on("data", (chunk) => (body += chunk));
            res.on("end", () => {
                let parsed = body;
                try {
                    parsed = JSON.parse(body);
                } catch (e) {
                    // plain text response
                }
                resolve({ status: res.statusCode, headers: res.headers, data: parsed, rawBody: body });
            });
        });
        req.on("error", reject);
        if (data) {
            req.write(typeof data === "string" ? data : JSON.stringify(data));
        }
        req.end();
    });
}

async function runTests() {
    process.env.PORT = PORT;
    server = await initializeDBAndServer();

    let passedCount = 0;
    let failedCount = 0;

    function assert(condition, testName, details = "") {
        if (condition) {
            console.log(`  [PASS] ${testName}`);
            passedCount++;
        } else {
            console.error(`  [FAIL] ${testName} ${details ? "- " + details : ""}`);
            failedCount++;
        }
    }

    try {
        console.log("\n=======================================================");
        console.log("  LAB 04: AUTOMATED VERIFICATION & TEST SUITE");
        console.log("=======================================================\n");

        // TEST 1: GET /
        console.log("TEST 1: Root Route Overview (GET /)");
        const resRoot = await request({ port: PORT, path: "/", method: "GET" });
        assert(resRoot.status === 200, "Root returns HTTP 200 OK");
        assert(resRoot.data.module === "Lab 4: Registration, login and JWT", "Root contains module title");

        // TEST 2: POST /register/ - Missing Fields
        console.log("\nTEST 2: Register Validation - Missing Fields (POST /register/)");
        const resMissing = await request({
            port: PORT,
            path: "/register/",
            method: "POST",
            headers: { "Content-Type": "application/json" },
        }, { username: "incomplete_user" });
        assert(resMissing.status === 400, "Missing fields rejected with HTTP 400 Bad Request");

        // TEST 3: POST /register/ - Successful Registration
        console.log("\nTEST 3: Register New User - Success (POST /register/)");
        const testUser = {
            username: `student_${Date.now()}`,
            name: "Test Student",
            password: "SecretPassword@123",
            gender: "Male",
            location: "Hyderabad"
        };
        const resRegister = await request({
            port: PORT,
            path: "/register/",
            method: "POST",
            headers: { "Content-Type": "application/json" },
        }, testUser);
        assert(resRegister.status === 200, "Valid registration returns HTTP 200 OK");
        assert(resRegister.rawBody === "User created successfully", "Response body is 'User created successfully'");

        // TEST 4: POST /register/ - Duplicate Username Rejection
        console.log("\nTEST 4: Register Duplicate Username - Rejection (POST /register/)");
        const resDuplicate = await request({
            port: PORT,
            path: "/register/",
            method: "POST",
            headers: { "Content-Type": "application/json" },
        }, testUser);
        assert(resDuplicate.status === 400, "Duplicate username rejected with HTTP 400 Bad Request");
        assert(resDuplicate.rawBody === "User already exists", "Response body is 'User already exists'");

        // TEST 5: Verify Database Stores Hashes Only
        console.log("\nTEST 5: Database Security - Storing Hashes Only (GET /users/)");
        const resUsers = await request({ port: PORT, path: "/users/", method: "GET" });
        assert(resUsers.status === 200, "GET /users/ returns HTTP 200 OK");
        const savedUserRecord = resUsers.data.find(u => u.username === testUser.username);
        assert(savedUserRecord !== undefined, "Registered user exists in database");
        assert(savedUserRecord.password.startsWith("$2b$") || savedUserRecord.password.startsWith("$2a$"), "Password is a valid bcrypt hash ($2b$...)");
        assert(savedUserRecord.password !== testUser.password, "Password is NEVER stored in plain text");

        // TEST 6: POST /login/ - Unknown User Rejection
        console.log("\nTEST 6: Login Unknown User - Rejection (POST /login/)");
        const resUnknown = await request({
            port: PORT,
            path: "/login/",
            method: "POST",
            headers: { "Content-Type": "application/json" },
        }, { username: "non_existent_user_999", password: "somePassword" });
        assert(resUnknown.status === 400, "Unknown user rejected with HTTP 400 Bad Request");
        assert(resUnknown.rawBody === "Invalid user", "Response body is 'Invalid user'");

        // TEST 7: POST /login/ - Wrong Password Rejection
        console.log("\nTEST 7: Login Wrong Password - Rejection (POST /login/)");
        const resWrongPass = await request({
            port: PORT,
            path: "/login/",
            method: "POST",
            headers: { "Content-Type": "application/json" },
        }, { username: testUser.username, password: "IncorrectPassword!" });
        assert(resWrongPass.status === 400, "Wrong password rejected with HTTP 400 Bad Request");
        assert(resWrongPass.rawBody === "Invalid password", "Response body is 'Invalid password'");

        // TEST 8: POST /login/ - Successful Login & Token Generation
        console.log("\nTEST 8: Login Success - Returns { jwt_token } (POST /login/)");
        const resLogin = await request({
            port: PORT,
            path: "/login/",
            method: "POST",
            headers: { "Content-Type": "application/json" },
        }, { username: testUser.username, password: testUser.password });
        assert(resLogin.status === 200, "Valid login returns HTTP 200 OK");
        assert(typeof resLogin.data.jwt_token === "string" && resLogin.data.jwt_token.length > 20, "Response contains valid jwt_token string");

        const token = resLogin.data.jwt_token;

        // TEST 9: JWT Token Inspection & Payload Security (Task 5)
        console.log("\nTEST 9: JWT Payload Security Check (Username only, never password)");
        const decoded = jwt.decode(token, { complete: true });
        assert(decoded !== null, "Token can be decoded");
        assert(decoded.header.alg === "HS256", "Token algorithm is HS256");
        assert(decoded.payload.username === testUser.username, "Token payload contains correct username");
        assert(decoded.payload.password === undefined, "Token payload NEVER contains password");

        // TEST 10: Verify Token with Constant Secret Key
        console.log("\nTEST 10: JWT Signature Verification (Signed with JWT_SECRET constant)");
        let verifiedPayload = null;
        try {
            verifiedPayload = jwt.verify(token, JWT_SECRET);
        } catch (e) {}
        assert(verifiedPayload !== null, "Token signature verified successfully with JWT_SECRET");

        // TEST 11: POST /decode-token/ Endpoint (Task 6 Support)
        console.log("\nTEST 11: Decode Token Endpoint (POST /decode-token/)");
        const resDecode = await request({
            port: PORT,
            path: "/decode-token/",
            method: "POST",
            headers: { "Content-Type": "application/json" },
        }, { jwt_token: token });
        assert(resDecode.status === 200, "Decode token returns HTTP 200 OK");
        assert(resDecode.data.signatureValid === true, "Signature reported as valid");
        assert(resDecode.data.payload.username === testUser.username, "Decoded payload username matches");

        console.log("\n-------------------------------------------------------");
        console.log(`SUMMARY: ${passedCount} passed, ${failedCount} failed`);
        console.log("-------------------------------------------------------\n");

        if (failedCount > 0) {
            process.exit(1);
        }
    } catch (err) {
        console.error("Test execution failed:", err);
        process.exit(1);
    } finally {
        if (server) {
            server.close();
        }
    }
}

runTests();
