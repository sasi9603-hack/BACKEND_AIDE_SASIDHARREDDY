const sqlite3 = require("sqlite3").verbose();
const path = require("path");

const dbPath = path.join(__dirname, "books.db");
const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error("Error connecting to database:", err.message);
        process.exit(1);
    }
    console.log("Connected to SQLite database at:", dbPath);
});

const createTableQuery = `
CREATE TABLE IF NOT EXISTS book (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    author TEXT NOT NULL,
    price INTEGER NOT NULL,
    pages INTEGER NOT NULL
);
`;

const initialBooks = [
    { title: "Harry Potter and the Sorcerer's Stone", author: "J.K. Rowling", price: 450, pages: 320 },
    { title: "The Hobbit", author: "J.R.R. Tolkien", price: 399, pages: 310 },
    { title: "To Kill a Mockingbird", author: "Harper Lee", price: 299, pages: 281 },
    { title: "The Great Gatsby", author: "F. Scott Fitzgerald", price: 250, pages: 180 },
    { title: "1984", author: "George Orwell", price: 320, pages: 328 },
    { title: "Pride and Prejudice", author: "Jane Austen", price: 220, pages: 279 },
    { title: "The Catcher in the Rye", author: "J.D. Salinger", price: 280, pages: 214 },
    { title: "The Alchemist", author: "Paulo Coelho", price: 350, pages: 208 },
    { title: "Clean Code", author: "Robert C. Martin", price: 650, pages: 464 },
    { title: "Atomic Habits", author: "James Clear", price: 499, pages: 320 }
];

db.serialize(() => {
    db.run("DROP TABLE IF EXISTS book;");
    db.run(createTableQuery, (err) => {
        if (err) {
            console.error("Error creating table:", err.message);
            return;
        }
        console.log("Table 'book' created successfully.");
    });

    const insertQuery = `INSERT INTO book (title, author, price, pages) VALUES (?, ?, ?, ?)`;
    const stmt = db.prepare(insertQuery);

    for (const book of initialBooks) {
        stmt.run(book.title, book.author, book.price, book.pages);
    }

    stmt.finalize((err) => {
        if (err) {
            console.error("Error inserting initial books:", err.message);
        } else {
            console.log("Successfully inserted 10 initial rows into 'book' table.");
        }
        db.close();
    });
});

