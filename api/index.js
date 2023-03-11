import express from "express";
import { client } from "./postgresqldb.js";

const app = express();

app.use(express.static("public"))

// Midlleware

app.use((req, _res, next) => {
    if(req.url === "/api/get") {
        console.log("Silahkan Masuk");
    }
    else if(req.url === "/api/getpg") {
        console.log("Silahkan Masuk 1");
    }
    next();
});

// Route
app.get("/api/get", async (_req, res) => {
    res.send("Tigana Reymansyah");
});

app.get("/api/getpg", async (_req, res) => {
    res.send((await client.query("SELECT * FROM jurusan")).rows);
});

app.listen(3000, () => console.log("Server sedang berjalan..."));