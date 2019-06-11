const {
    getUsers,
    createUser,
    loginUser,
    getUser,
    changeUser,
    changeUserPhoto
} = require("../controllers/userController");

const users = (req, res, db, headers) => {
    if (req.method === "GET" && req.url === "/users") {
        getUsers(req, res, db, headers);
    } else if (req.method === "POST" && req.url === "/users/register") {
        return createUser(req, res, db, headers);
    } else if (req.method === "POST" && req.url === "/users/login") {
        return loginUser(req, res, db, headers);
    } else if (req.method === "GET" && req.url.includes("/users?user=")) {
        return getUser(req, res, db, headers);
    } else if (req.method === "POST" && req.url.includes("/users/change?user=")) {
        return changeUser(req, res, db, headers);
    } else if (req.method === "POST" && req.url.includes("/users/image?user=")) {
        return changeUserPhoto(req, res, db, headers);
    } else {
        res.writeHead(404, headers);
        res.end(`${req.url} is not here.`);
    }
};

module.exports = users;
