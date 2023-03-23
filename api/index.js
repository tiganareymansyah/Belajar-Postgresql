import dotenv from "dotenv";
dotenv.config();

import express from "express";
import { client } from "./postgresqldb.js";

import jwt from "jsonwebtoken";

import cookieParser from "cookie-parser";

import bcrypt from "bcryptjs";

const app = express();

// Middleware untuk membaca body yang berformat JSON
app.use(express.json());

// middleware untuk mengelola cookie
app.use(cookieParser());

// middleware untuk mengalihkan ke halaman login
app.use((req, res, next) => {
    if (req.path.startsWith("/assets") || req.path.startsWith("/api")) {
      next();
    } else {
      if (req.cookies.token) {
        if (req.path.startsWith("/login")) {
          res.redirect("/");
        } else {
          next();
        }
      } else {
        if (req.path.startsWith("/login")) {
          next();
        } else {
          res.redirect("/login");
        }
      }
    }
  });

// middleware untuk mengakses file statis
app.use(express.static("public"));

// Route token
// Login
app.post("/api/login", async (req, res) => {
    const result = await client.query(`SELECT * FROM mahasiswa WHERE username = '${req.body.username}'`);
    if(result.rows.length > 0) {
        if(await bcrypt.compare(req.body.password_, result.rows[0].password_)) {
            const token = jwt.sign(result.rows[0], process.env.JWT_SECRET_KEY);
            res.cookie("token", token);
            res.send("Login berhasil");
        }
        else {
            res.status(401);
            res.send("Password salah");
        }
    }
    else {
        res.status(401);
        res.send("Mahasiswa tidak ditemukan");
    }
});

app.post("/api/post", async (req, res) => {
    const salt = await bcrypt.genSalt();
    const hash = await bcrypt.hash(req.body.password_, salt);
    client.query(`INSERT INTO mahasiswa (username, password_) VALUES ('${req.body.username}', '${hash}')`);
    res.send("Data berhasil ditambahkan");
});

// middleware untuk mengotentikasi pengguna
app.use((req, res, next) => {
    if(req.cookies.token) {
        try {
            jwt.verify(req.cookies.token, process.env.JWT_SECRET_KEY);
            next();
        }
        catch (err) {
            res.status(401);
            res.send("Anda harus login lagi");
        }
    }
    else {
        res.status(401);
        res.send("Anda harus login terlebih dahulu");
    }
});

// dapatkan mahasiswa yang login
app.get("/api/me", (req, res) => {
    const me = jwt.verify(req.cookies.token, process.env.JWT_SECRET_KEY);
    res.json(me);
});

// Route
app.get("/api/get/:a/:b", async (req, res) => {
    res.send(req.params);
});

app.get("/api/get/:id", async (req, res) => {
    const result = await client.query(`SELECT * FROM mahasiswa WHERE id = '${req.params.id}'`);
    res.send(result.rows[0]);
});

app.get("/api/getpg", async (_req, res) => {
    res.send((await client.query("SELECT * FROM mahasiswa")).rows);
});

// app.post("/api/post", async (req, res) => {
//     const salt = await bcrypt.genSalt();
//     const hash = await bcrypt.hash(req.body.password_, salt);
//     client.query(`INSERT INTO mahasiswa (username, password_) VALUES ('${req.body.username}', '${hash})`);
//     res.send("Data berhasil ditambahkan");
// });

app.put("/api/put/:nim", (req, res) => {
    client.query(`UPDATE mahasiswa SET nama = '${req.body.username}' WHERE id = '${req.params.id}'`);
    res.send("Data berhasil diperbarui");
});

app.delete("/api/delete/:nim", async (req, res) => {
    await client.query(`DELETE FROM mahasiswa WHERE id = '${req.params.id}'`);
    res.send("Data berhasil dihapus");
});

app.post("/api/deletetoken", async (req, res) => {
    res.clearCookie(`${req.body.token}`);
    res.redirect("/login");
});

app.listen(3000, () => console.log("Server sedang berjalan..."));