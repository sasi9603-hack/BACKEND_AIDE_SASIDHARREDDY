# Backend Development Fundamentals (MERN Stack)
---
| Field | Details | Field | Details |
| :--- | :--- | :--- | :--- |
| **Student Name** | V. Sasidhar Reddy | | |
| **Student Registration Number** | 252U1R5130 | **Class & Section** | AIDE - 2B & 313 |
| **Study Level** <br>`UG/PG/Doctorate` | UG | **Year & Term** | II & II |
| **TOPIC** | Lab 3: REST API, query parameters, validation, debugging | **Course** | Backend Development Fundamentals |
| **Faculty Name** | Yugandhar Gurjalwar | | |

| Field | Details |
| :--- | :--- |
| **Name of the Assessment** | Lab Report 3 |
| **Date of Submission** | 06-11-2026 |
---
---

## Course Lab Index & Live Deployments

This repository contains all laboratory exercises and coursework for the Backend Development Fundamentals module (Year II Term II). Each lab is organized into its respective folder from `lab-01` to `lab-10`.

| Lab Number | Topic / Module | Folder Link | Status | Live Render URL |
| :---: | :--- | :---: | :---: | :--- |
| **Lab 01** | Node.js and Express Server Fundamentals | [lab-01](./lab-01) | Completed | [Live Deployment (Render)](https://sasidhar-lab-01-express.onrender.com) |
| **Lab 02** | SQLite Database and CRUD Routes | [lab-02](./lab-02) | Completed | [Live Deployment (Render)](https://sasidhar-lab-02-sqlite.onrender.com) |
| **Lab 03** | REST API, Query Parameters, Validation & Debugging | [lab-03](./lab-03) | Completed | [Live Deployment (Render)](https://backend-aide-sasidharreddy.onrender.com) |
| **Lab 04** | *Upcoming Lab* | `lab-04/` | Pending | — |
| **Lab 05** | *Upcoming Lab* | `lab-05/` | Pending | — |
| **Lab 06** | *Upcoming Lab* | `lab-06/` | Pending | — |
| **Lab 07** | *Upcoming Lab* | `lab-07/` | Pending | — |
| **Lab 08** | *Upcoming Lab* | `lab-08/` | Pending | — |
| **Lab 09** | *Upcoming Lab* | `lab-09/` | Pending | — |
| **Lab 10** | *Upcoming Lab* | `lab-10/` | Pending | — |

---

## Render Deployment Quick Links & Configuration

This repository is pre-configured with a **Render Blueprint** (`render.yaml`) for zero-configuration multi-service deployment.

### 🌐 Quick Deployment Links
- **Render Dashboard**: [https://dashboard.render.com](https://dashboard.render.com)
- **New Web Service**: [https://dashboard.render.com/web/new](https://dashboard.render.com/web/new)
- **New Blueprint**: [https://dashboard.render.com/blueprints/new](https://dashboard.render.com/blueprints/new)
- **GitHub Repository**: [https://github.com/sasi9603-hack/BACKEND_AIDE_SASIDHARREDDY](https://github.com/sasi9603-hack/BACKEND_AIDE_SASIDHARREDDY)

### 📋 Service Deployment Settings Summary

| Parameter | Lab 01 (Express Basics) | Lab 02 (SQLite & CRUD) | Lab 03 (Query Params & REST API) |
| :--- | :--- | :--- | :--- |
| **Service Type** | Web Service | Web Service | Web Service |
| **Service Name** | `sasidhar-lab-01-express` | `sasidhar-lab-02-sqlite` | `sasidhar-lab-03-api` |
| **Runtime** | `Node` | `Node` | `Node` |
| **Root Directory** | `lab-01` | `lab-02` | `lab-03` |
| **Build Command** | `npm install` | `npm install` | `npm install` |
| **Start Command** | `npm start` | `npm start` | `npm start` |
| **Plan** | Free | Free | Free |
| **Live URL** | `https://sasidhar-lab-01-express.onrender.com` | `https://sasidhar-lab-02-sqlite.onrender.com` | `https://sasidhar-lab-03-api.onrender.com` |
| **Primary Test Route**| `GET /` & `GET /about` | `GET /` & `GET /books/` | `GET /` & `GET /books` |

---

## Global Repository Guidelines
- Never commit `.env` or sensitive credentials (`.gitignore` enforced).
- Never commit `node_modules`.
- Regular commits with clear, descriptive messages.
