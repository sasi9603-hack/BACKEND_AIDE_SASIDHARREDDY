const express = require("express");
const path = require("path");
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");

const app = express();
app.use(express.json());

const dbPath = path.join(__dirname, "books.db");
let db = null;

// Task 3: initializeDBAndServer async function that opens DB and starts server
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
        console.error(`DB Error: ${e.message}`);
        process.exit(1);
    }
};

initializeDBAndServer();

// Welcome / health check endpoint for cloud deployment
app.get("/", (request, response) => {
    response.status(200).json({
        message: "Welcome to Lab 02: SQLite Database and CRUD Routes API",
        author: "Sasidhar Reddy",
        section: "AIDE-313-2B",
        endpoints: {
            getAllBooks: "GET /books/",
            getBookById: "GET /books/:bookId/",
            addBook: "POST /books/",
            updateBook: "PUT /books/:bookId/",
            deleteBook: "DELETE /books/:bookId/"
        }
    });
});

// Task 4 & 5: GET /books/ - Retrieve all books
app.get("/books/", async (request, response) => {
    try {
        const getBooksQuery = `
            SELECT
                *
            FROM
                book
            ORDER BY
                id;
        `;
        const booksArray = await db.all(getBooksQuery);
        response.status(200).json(booksArray);
    } catch (error) {
        response.status(500).json({ error: error.message });
    }
});

// Task 4 & 5: GET /books/:bookId/ - Retrieve single book by ID
app.get("/books/:bookId/", async (request, response) => {
    try {
        const { bookId } = request.params;
        const getBookQuery = `
            SELECT
                *
            FROM
                book
            WHERE
                id = ?;
        `;
        const book = await db.get(getBookQuery, [bookId]);
        if (!book) {
            return response.status(404).json({ error: "Book not found" });
        }
        response.status(200).json(book);
    } catch (error) {
        response.status(500).json({ error: error.message });
    }
});

// Task 4 & 5: POST /books/ - Add a new book
app.post("/books/", async (request, response) => {
    try {
        const { title, author, price, pages } = request.body;
        if (!title || !author || price === undefined || pages === undefined) {
            return response.status(400).json({
                error: "Missing required fields: title, author, price, pages",
            });
        }
        const addBookQuery = `
            INSERT INTO
                book (title, author, price, pages)
            VALUES
                (?, ?, ?, ?);
        `;
        const dbResponse = await db.run(addBookQuery, [title, author, price, pages]);
        response.status(201).json({
            message: "Book Added Successfully",
            bookId: dbResponse.lastID,
        });
    } catch (error) {
        response.status(500).json({ error: error.message });
    }
});

// Task 4 & 5: PUT /books/:bookId/ - Update an existing book
app.put("/books/:bookId/", async (request, response) => {
    try {
        const { bookId } = request.params;
        const { title, author, price, pages } = request.body;

        const checkBookQuery = `SELECT * FROM book WHERE id = ?;`;
        const existingBook = await db.get(checkBookQuery, [bookId]);
        if (!existingBook) {
            return response.status(404).json({ error: "Book not found" });
        }

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
            title ?? existingBook.title,
            author ?? existingBook.author,
            price ?? existingBook.price,
            pages ?? existingBook.pages,
            bookId,
        ]);
        response.status(200).json({
            message: "Book Details Updated Successfully",
            updatedBookId: Number(bookId),
        });
    } catch (error) {
        response.status(500).json({ error: error.message });
    }
});

// Task 4 & 5: DELETE /books/:bookId/ - Delete a book by ID
app.delete("/books/:bookId/", async (request, response) => {
    try {
        const { bookId } = request.params;
        const checkBookQuery = `SELECT * FROM book WHERE id = ?;`;
        const existingBook = await db.get(checkBookQuery, [bookId]);
        if (!existingBook) {
            return response.status(404).json({ error: "Book not found" });
        }

        const deleteBookQuery = `
            DELETE FROM
                book
            WHERE
                id = ?;
        `;
        await db.run(deleteBookQuery, [bookId]);
        response.status(200).json({
            message: "Book Deleted Successfully",
            deletedBookId: Number(bookId),
        });
    } catch (error) {
        response.status(500).json({ error: error.message });
    }
});

// 404 Route Handler
app.use((req, res) => {
    res.status(404).json({ error: "404 - Route Not Found" });
});

module.exports = app;
