import express from "express";
import { client } from "./postgresqldb.js";

const app = express();

app.use(express.static("public"))

// Midlleware
// app.use((req, _res, next) => {
//     if(req.url === "/api/getpg") {
//         console.log("Silahkan Masuk");
//     }
//     next();
// });

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

// Membuat supaya bisa baca json
app.use(express.json());

// Route
app.get("/api/getpg", async (_req, res) => {
    res.send((await client.query("SELECT * FROM mahasiswa")).rows);
});

app.get("/api/get/:a/:b", async (req, res) => {
    res.send(req.params);
});

app.get("/api/get/:nim", async (req, res) => {
    const result = await client.query(`SELECT * FROM mahasiswa WHERE nim = '${req.params.nim}'`);
    res.send(result.rows[0]);
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