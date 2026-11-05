const express = require("express");
const path = require("path");
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");

const app = express();
app.use(express.json());

const dbPath = path.join(__dirname, "books.db");
let db = null;

// Initialize SQLite database connection and start Express server
const initializeDBAndServer = async () => {
    try {
        db = await open({
            filename: dbPath,
            driver: sqlite3.Database,
        });

        const PORT = process.env.PORT || 3000;
        app.listen(PORT, () => {
            console.log(`Server Running at http://localhost:${PORT}/`);
        });
    } catch (e) {
        console.error(`DB Initialization Error: ${e.message}`);
        process.exit(1);
    }
};

initializeDBAndServer();

// Root route: API Information & Overview
app.get("/", (request, response) => {
    response.status(200).json({
        message: "Welcome to Lab 03: REST API, Query Parameters, Validation & Debugging",
        author: "Sasidhar Reddy",
        section: "AIDE-313-2B",
        endpoints: {
            getAllBooks: "GET /books?search_q=&order_by=id&order=ASC&limit=10&offset=0&min_price=&max_price=",
            getBookById: "GET /books/:bookId",
            createBook: "POST /books",
            updateBook: "PUT /books/:bookId",
            deleteBook: "DELETE /books/:bookId",
        },
    });
});

// Task 1, 2, 3: GET /books - Search, Sort, Filter, and Pagination
app.get("/books", async (request, response) => {
    try {
        const {
            search_q = "",
            order_by = "id",
            order = "ASC",
            limit = 10,
            offset = 0,
            min_price,
            max_price,
        } = request.query;

        // Whitelist allowed columns for ordering to avoid SQL injection
        const allowedColumns = ["id", "title", "author", "price", "pages"];
        const sanitizedOrderBy = allowedColumns.includes(order_by.toLowerCase())
            ? order_by.toLowerCase()
            : "id";

        // Whitelist order direction
        const sanitizedOrder = order.toUpperCase() === "DESC" ? "DESC" : "ASC";

        // Parse pagination limits
        const parsedLimit = Math.max(1, parseInt(limit, 10) || 10);
        const parsedOffset = Math.max(0, parseInt(offset, 10) || 0);

        // Build dynamic WHERE clause with parameterised values
        const conditions = [];
        const params = [];

        // 1. Partial title match (search_q)
        if (search_q.trim() !== "") {
            conditions.push("title LIKE ?");
            params.push(`%${search_q.trim()}%`);
        }

        // 2. Price filtering (Task 3: BETWEEN or min_price/max_price)
        if (min_price !== undefined && max_price !== undefined) {
            const min = parseFloat(min_price);
            const max = parseFloat(max_price);
            if (isNaN(min) || isNaN(max)) {
                return response.status(400).json({
                    message: "min_price and max_price query parameters must be valid numbers",
                });
            }
            conditions.push("price BETWEEN ? AND ?");
            params.push(min, max);
        } else if (min_price !== undefined) {
            const min = parseFloat(min_price);
            if (isNaN(min)) {
                return response.status(400).json({
                    message: "min_price query parameter must be a valid number",
                });
            }
            conditions.push("price >= ?");
            params.push(min);
        } else if (max_price !== undefined) {
            const max = parseFloat(max_price);
            if (isNaN(max)) {
                return response.status(400).json({
                    message: "max_price query parameter must be a valid number",
                });
            }
            conditions.push("price <= ?");
            params.push(max);
        }

        const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";

        const getBooksQuery = `
            SELECT
                *
            FROM
                book
            ${whereClause}
            ORDER BY
                ${sanitizedOrderBy} ${sanitizedOrder}
            LIMIT ? OFFSET ?;
        `;

        params.push(parsedLimit, parsedOffset);

        const books = await db.all(getBooksQuery, params);
        response.status(200).json(books);
    } catch (error) {
        response.status(500).json({ message: error.message });
    }
});

// Task 1 & 5: GET /books/:bookId - Retrieve Single Book by ID
app.get("/books/:bookId", async (request, response) => {
    try {
        const { bookId } = request.params;
        const getBookQuery = `SELECT * FROM book WHERE id = ?;`;
        const book = await db.get(getBookQuery, [bookId]);

        if (!book) {
            return response.status(404).json({ message: "Book not found" });
        }

        response.status(200).json(book);
    } catch (error) {
        response.status(500).json({ message: error.message });
    }
});

// Task 1, 4, 5, 6: POST /books - Validate Body, Create Book & Return 201
app.post("/books", async (request, response) => {
    try {
        const { title, author, price, pages } = request.body;

        // Validation: reject missing title
        if (!title || typeof title !== "string" || title.trim() === "") {
            return response.status(400).json({
                message: "Missing required field: title",
            });
        }

        // Validation: reject missing author
        if (!author || typeof author !== "string" || author.trim() === "") {
            return response.status(400).json({
                message: "Missing required field: author",
            });
        }

        // Validation: reject non-numeric price or missing price
        if (price === undefined || price === null || isNaN(Number(price)) || Number(price) < 0) {
            return response.status(400).json({
                message: "Price must be a valid positive number",
            });
        }

        // Validation: pages (defaults to 100 if omitted or non-numeric)
        const sanitizedPages = (!pages || isNaN(Number(pages)) || Number(pages) <= 0) ? 100 : Number(pages);

        const insertBookQuery = `
            INSERT INTO
                book (title, author, price, pages)
            VALUES
                (?, ?, ?, ?);
        `;

        const dbResponse = await db.run(insertBookQuery, [
            title.trim(),
            author.trim(),
            Number(price),
            sanitizedPages,
        ]);

        response.status(201).json({
            message: "Book created successfully",
            bookId: dbResponse.lastID,
        });
    } catch (error) {
        response.status(500).json({ message: error.message });
    }
});

// Task 1, 5, 6: PUT /books/:bookId - Update Existing Book & Return 200 / 404
app.put("/books/:bookId", async (request, response) => {
    try {
        const { bookId } = request.params;
        const { title, author, price, pages } = request.body;

        // Check if book exists
        const checkBookQuery = `SELECT * FROM book WHERE id = ?;`;
        const existingBook = await db.get(checkBookQuery, [bookId]);

        if (!existingBook) {
            return response.status(404).json({ message: "Book not found" });
        }

        // Validation for price if provided
        if (price !== undefined && (isNaN(Number(price)) || Number(price) < 0)) {
            return response.status(400).json({
                message: "Price must be a valid positive number",
            });
        }

        const updatedTitle = title !== undefined && title.trim() !== "" ? title.trim() : existingBook.title;
        const updatedAuthor = author !== undefined && author.trim() !== "" ? author.trim() : existingBook.author;
        const updatedPrice = price !== undefined ? Number(price) : existingBook.price;
        const updatedPages = pages !== undefined && !isNaN(Number(pages)) ? Number(pages) : existingBook.pages;

        const updateBookQuery = `
            UPDATE
                book
            SET
                title = ?,
                author = ?,
                price = ?,
                pages = ?
            WHERE
                id = ?;
        `;

        await db.run(updateBookQuery, [
            updatedTitle,
            updatedAuthor,
            updatedPrice,
            updatedPages,
            bookId,
        ]);

        response.status(200).json({
            message: "Book updated successfully",
            updatedBookId: Number(bookId),
        });
    } catch (error) {
        response.status(500).json({ message: error.message });
    }
});

// Task 1, 5, 6: DELETE /books/:bookId - Delete Book & Return 200 / 404
app.delete("/books/:bookId", async (request, response) => {
    try {
        const { bookId } = request.params;

        // Check if book exists
        const checkBookQuery = `SELECT * FROM book WHERE id = ?;`;
        const existingBook = await db.get(checkBookQuery, [bookId]);

        if (!existingBook) {
            return response.status(404).json({ message: "Book not found" });
        }

        const deleteBookQuery = `DELETE FROM book WHERE id = ?;`;
        await db.run(deleteBookQuery, [bookId]);

        response.status(200).json({
            message: "Book deleted successfully",
            deletedBookId: Number(bookId),
        });
    } catch (error) {
        response.status(500).json({ message: error.message });
    }
});

// Catch-all 404 route for unknown endpoints
app.use((request, response) => {
    response.status(404).json({ message: "404 - Route Not Found" });
});

module.exports = app;
