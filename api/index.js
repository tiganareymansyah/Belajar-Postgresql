import dotenv from "dotenv";
dotenv.config();

import express from "express";
import { client } from "./postgresqldb.js";

import jwt from "jsonwebtoken";

const app = express();
app.use(express.static("public"));

// Membuat supaya bisa baca json
app.use(express.json());

// Midlleware
// app.use((req, _res, next) => {
//     if(req.url === "/api/getpg") {
//         console.log("Silahkan Masuk");
//     }
//     next();
// });

// Route token
app.post("/api/token", async (req, res) => {
    const result = await client.query(`SELECT * FROM mahasiswa WHERE nim = '${req.body.nim}'`)
    if(result.rows.length > 0) {
        if(req.body.nim === result.rows[0].nim) {
            const token = jwt.sign(result.rows[0], process.env.JWT_SECRET_KEY);
            res.send(token);
        }
        else {
            res.status(401);
            res.send("Nim salah");
        }
    }
    else {
        res.status(401);
        res.send("Mahasiswa tidak ditemukan");
    }
});

// JWT
app.use((req, res, next) => {
    if(req.headers.authorization === "Bearer abcd") {
        next();
    }
    else {
        res.status(401);
        res.send("Token salah");
    }
});

// Route
app.get("/api/get/:a/:b", async (req, res) => {
    res.send(req.params);
});

app.get("/api/get/:nim", async (req, res) => {
    const result = await client.query(`SELECT * FROM mahasiswa WHERE nim = '${req.params.nim}'`);
    res.send(result.rows[0]);
});

app.get("/api/getpg", async (_req, res) => {
    res.send((await client.query("SELECT * FROM mahasiswa")).rows);
});

app.post("/api/post", (req, res) => {
    client.query(`INSERT INTO mahasiswa VALUES ('${req.body.nim}', '${req.body.nama}')`);
    res.send("Data berhasil ditambahkan");
});

app.put("/api/put/:nim", (req, res) => {
    client.query(`UPDATE mahasiswa SET nama = '${req.body.nama}' WHERE nim = '${req.params.nim}'`);
    res.send("Data berhasil diperbarui");
});

app.delete("/api/delete/:nim", async (req, res) => {
    await client.query(`DELETE FROM mahasiswa WHERE nim = '${req.params.nim}'`);
    res.send("Data berhasil dihapus");
});

app.listen(3000, () => console.log("Server sedang berjalan..."));