import express from "express";
import { client } from "./postgresqldb.js";

const app = express();

app.use(express.static("public"))

// Midlleware

app.use((req, _res, next) => {
    if(req.url === "/api/getpg") {
        console.log("Silahkan Masuk");
    }
    next();
});

// Route
app.get("/api/getpg", async (_req, res) => {
    res.send((await client.query("SELECT * FROM mahasiswa")).rows);
});

app.listen(3000, () => console.log("Server sedang berjalan..."));