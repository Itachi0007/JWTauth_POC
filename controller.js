const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

require("dotenv").config();

var users = [];

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
        const user = users.filter((data) => data.name == req.user.username)[0];
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
                username: user.name,
            };
            const accessToken = jwt.sign(payload, process.env.ACCESS_TOKEN);
            res.send(accessToken);
        } else {
            res.send("Not Allowed");
        }
    } catch {
        res.status(500).send("Internal server error");
    }
};

exports.get = async (req, res) => {
    res.send(users);
};
