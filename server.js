const express = require("express");
const jwt = require("jsonwebtoken");
const app = express();

const Controller = require("./controller");

app.use(express.json()); // else if wont parse req body from JSON

app.get("/users", (req, res) => {
    Controller.get(req, res);
});

app.post("/users/new", (req, res) => {
    Controller.addUser(req, res);
});

app.post("/users/login", (req, res) => {
    // to generate the token
    Controller.login(req, res);
});

app.get("/user/name", authenticateToken, (req, res) => {
    // to get my username using token verification
    Controller.username(req, res);
});

app.listen(3000, () => {
    console.log(`Server started at ${3000}...`);
});

function authenticateToken(req, res, next) {
    // authenticate the user's token
    const authHeader = req.headers["authorization"];
    const token = authHeader && authHeader.split(" ")[1];
    if (!token) {
        return res.status(401).json("PLEASE PASS A TOKEN");
    }
    jwt.verify(token, process.env.ACCESS_TOKEN, (err, payload) => {
        if (err) return res.status(403).json("invalid token passed");
        req.user = payload;
        next();
    });
}
