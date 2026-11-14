const sqlite3 = require("sqlite3").verbose();
const path = require("path");
const bcrypt = require("bcrypt");

const dbPath = path.join(__dirname, "userData.db");
const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error("Error connecting to database:", err.message);
        process.exit(1);
    }
    console.log("Connected to SQLite database at:", dbPath);
});

const createTableQuery = `
CREATE TABLE IF NOT EXISTS user (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    password TEXT NOT NULL,
    gender TEXT,
    location TEXT
);
`;

const seedDatabase = async () => {
    try {
        // Hash sample passwords using bcrypt with salt rounds = 10
        const hashedAdminPassword = await bcrypt.hash("Admin@123", 10);
        const hashedRahulPassword = await bcrypt.hash("rahul2026", 10);
        const hashedSasidharPassword = await bcrypt.hash("sasiPass#4", 10);

        const initialUsers = [
            {
                username: "admin_user",
                name: "System Administrator",
                password: hashedAdminPassword,
                gender: "Male",
                location: "Hyderabad"
            },
            {
                username: "rahul_sharma",
                name: "Rahul Sharma",
                password: hashedRahulPassword,
                gender: "Male",
                location: "Bengaluru"
            },
            {
                username: "sasidhar_reddy",
                name: "V. Sasidhar Reddy",
                password: hashedSasidharPassword,
                gender: "Male",
                location: "Hyderabad"
            }
        ];

        db.serialize(() => {
            db.run("DROP TABLE IF EXISTS user;");
            db.run(createTableQuery, (err) => {
                if (err) {
                    console.error("Error creating table:", err.message);
                    return;
                }
                console.log("Table 'user' created successfully with UNIQUE username, name, and hashed password columns.");
            });

            const insertQuery = `INSERT INTO user (username, name, password, gender, location) VALUES (?, ?, ?, ?, ?)`;
            const stmt = db.prepare(insertQuery);

            for (const user of initialUsers) {
                stmt.run(user.username, user.name, user.password, user.gender, user.location);
            }

            stmt.finalize((err) => {
                if (err) {
                    console.error("Error finalizing statement:", err.message);
                } else {
                    console.log(`Seeded ${initialUsers.length} initial users with hashed passwords.`);
                }
                db.close((closeErr) => {
                    if (closeErr) {
                        console.error("Error closing database:", closeErr.message);
                    } else {
                        console.log("Database setup completed and connection closed.");
                    }
                });
            });
        });
    } catch (error) {
        console.error("Error during database seeding:", error.message);
        db.close();
    }
};

seedDatabase();
