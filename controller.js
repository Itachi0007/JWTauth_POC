const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

require("dotenv").config();

var users = [];
let refreshTokens = [];

exports.addUser = async (req, res) => {
    try {
        const hashedPassword = await bcrypt.hash(req.body.password, 10);
        var user = {
            name: req.body.name,
            password: hashedPassword,
        };
        users.push(user);
        return res.status(201).send("Created user successfully");
    } catch {
        return res.status(500).send("Internal server error");
    }
};

exports.username = async (req, res) => {
    try {
        // only send his username
        const user = users.filter((data) => data.name == req.user.name)[0];
        const response = `Hi ${user.name}`;
        return res.status(201).send(response);
    } catch {
        return res.status(500).send("Internal server error");
    }
};

exports.login = async (req, res) => {
    const user = users.find((user) => user.name === req.body.name);
    if (user == null) {
        return res.status(400).send("Cannot find user");
    }
    try {
        if (await bcrypt.compare(req.body.password, user.password)) {
            const payload = {
                name: user.name,
            };
            // generating access token
            const accessToken = jwt.sign(payload, process.env.ACCESS_TOKEN, {expiresIn: "15s"});
            const refreshToken = jwt.sign(payload, process.env.REFRESH_TOKEN);
            refreshTokens.push(refreshToken);
            res.json({accessToken: accessToken, refreshToken: refreshToken});
        } else {
            res.send("Not Allowed");
        }
    } catch {
        res.status(500).send("Internal server error");
    }
};

exports.refToken = async (req, res) => {
    const refreshToken = req.body.token; // using the refresh token to generate new access token
    if (refreshToken == null) return res.status(401).send("Please pass a refresh token");

    if (!refreshTokens.includes(refreshToken)) return res.status(403).send("Invalid refresh token");

    jwt.verify(refreshToken, process.env.REFRESH_TOKEN, (err, user) => {
        if (err) return res.status(403).send("Token couldn't be verified");
        const accessToken = jwt.sign({name: user.name}, process.env.ACCESS_TOKEN, {expiresIn: "30s"}); // payload must not have all details
        res.json({accessToken: accessToken});
    });
};

exports.logout = async (req, res) => {
    // deleting the refresh token from DB
    refreshTokens = refreshTokens.filter((token) => token !== req.body.token);
    return res.status(200).send("Logged out successfully");
};

exports.get = async (req, res) => {
    res.send(users);
};
