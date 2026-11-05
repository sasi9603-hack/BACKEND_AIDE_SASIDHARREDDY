const http = require("http");
const app = require("./app");

const PORT = 3005;
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
                } catch (e) {}
                resolve({ status: res.statusCode, headers: res.headers, data: parsed });
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
    server = app.listen(PORT, async () => {
        console.log(`Test server running on port ${PORT}...`);
        try {
            console.log("\n--- TEST 1: Root overview ---");
            const resRoot = await request({ port: PORT, path: "/", method: "GET" });
            console.log("Status:", resRoot.status, "| Message:", resRoot.data.message);

            console.log("\n--- TEST 2: GET /books (Default params) ---");
            const resAll = await request({ port: PORT, path: "/books", method: "GET" });
            console.log("Status:", resAll.status, "| Books count:", resAll.data.length);

            console.log("\n--- TEST 3: GET /books?search_q=Harry (Search) ---");
            const resSearch = await request({ port: PORT, path: "/books?search_q=Harry", method: "GET" });
            console.log("Status:", resSearch.status, "| Result titles:", resSearch.data.map(b => b.title));

            console.log("\n--- TEST 4: GET /books?order_by=price&order=DESC (Sorting) ---");
            const resSort = await request({ port: PORT, path: "/books?order_by=price&order=DESC&limit=3", method: "GET" });
            console.log("Status:", resSort.status, "| Prices (DESC):", resSort.data.map(b => b.price));

            console.log("\n--- TEST 5: GET /books?min_price=300&max_price=450 (Price Range) ---");
            const resPrice = await request({ port: PORT, path: "/books?min_price=300&max_price=450", method: "GET" });
            console.log("Status:", resPrice.status, "| Books in range:", resPrice.data.map(b => `${b.title} ($${b.price})`));

            console.log("\n--- TEST 6: GET /books/1 (Single Book) ---");
            const resSingle = await request({ port: PORT, path: "/books/1", method: "GET" });
            console.log("Status:", resSingle.status, "| Book:", resSingle.data.title);

            console.log("\n--- TEST 7: GET /books/999 (Non-existent Single Book -> 404) ---");
            const res404 = await request({ port: PORT, path: "/books/999", method: "GET" });
            console.log("Status:", res404.status, "| Response:", res404.data);

            console.log("\n--- TEST 8: POST /books (Valid -> 201) ---");
            const newBook = { title: "Pragmatic Programmer", author: "Andy Hunt", price: 580, pages: 352 };
            const resCreate = await request({
                port: PORT,
                path: "/books",
                method: "POST",
                headers: { "Content-Type": "application/json" }
            }, newBook);
            console.log("Status:", resCreate.status, "| Response:", resCreate.data);

            console.log("\n--- TEST 9: POST /books (Validation: Missing Title -> 400) ---");
            const invalidBook1 = { author: "No Title", price: 400 };
            const resVal1 = await request({
                port: PORT,
                path: "/books",
                method: "POST",
                headers: { "Content-Type": "application/json" }
            }, invalidBook1);
            console.log("Status:", resVal1.status, "| Response:", resVal1.data);

            console.log("\n--- TEST 10: POST /books (Validation: Non-numeric Price -> 400) ---");
            const invalidBook2 = { title: "Bad Price", author: "Some Author", price: "free" };
            const resVal2 = await request({
                port: PORT,
                path: "/books",
                method: "POST",
                headers: { "Content-Type": "application/json" }
            }, invalidBook2);
            console.log("Status:", resVal2.status, "| Response:", resVal2.data);

            console.log("\n--- TEST 11: PUT /books/2 (Update Book -> 200) ---");
            const updateData = { title: "The Hobbit - Anniversary Edition", price: 420 };
            const resUpdate = await request({
                port: PORT,
                path: "/books/2",
                method: "PUT",
                headers: { "Content-Type": "application/json" }
            }, updateData);
            console.log("Status:", resUpdate.status, "| Response:", resUpdate.data);

            console.log("\n--- TEST 12: PUT /books/999 (Update Non-existent -> 404) ---");
            const resUp404 = await request({
                port: PORT,
                path: "/books/999",
                method: "PUT",
                headers: { "Content-Type": "application/json" }
            }, { title: "Ghost" });
            console.log("Status:", resUp404.status, "| Response:", resUp404.data);

            console.log("\n--- TEST 13: DELETE /books/10 (Delete Book -> 200) ---");
            const resDel = await request({ port: PORT, path: "/books/10", method: "DELETE" });
            console.log("Status:", resDel.status, "| Response:", resDel.data);

            console.log("\n--- TEST 14: DELETE /books/999 (Delete Non-existent -> 404) ---");
            const resDel404 = await request({ port: PORT, path: "/books/999", method: "DELETE" });
            console.log("Status:", resDel404.status, "| Response:", resDel404.data);

            console.log("\nALL TESTS PASSED SUCCESSFULLY!");
        } catch (err) {
            console.error("Test execution failed:", err);
        } finally {
            server.close();
            process.exit(0);
        }
    });
}

runTests();
