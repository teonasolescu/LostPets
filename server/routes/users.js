const {
    getUsers,
    createUser,
    loginUser,
    getUser,
    changeUser,
    changeUserPhoto,
    createPet,
    addPetImage,
    getPets,
    getStatistics,
    getRaport,
    getNotifications,
    readNotifications
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
    } else if (req.method === "GET" && req.url.includes("/users/pets?user=")) {
        return getPets(req, res, db, headers);
    } else if (req.method === "GET" && req.url.includes("/users/notifications?user=")) {
        return getNotifications(req, res, db, headers);
    } else if (req.method === "GET" && req.url.includes("/users/notifications-read?user=")) {
        return readNotifications(req, res, db, headers);
    } else if (req.method === "GET" && req.url === "/users/statistics") {
        return getStatistics(req, res, db, headers);
    } else if (req.method === "POST" && req.url.includes("/users/change?user=")) {
        return changeUser(req, res, db, headers);
    } else if (req.method === "GET" && req.url.includes("/users/raport?type=")) {
        return getRaport(req, res, db, headers);
    } else if (req.method === "POST" && req.url.includes("/users/pet?user=")) {
        return createPet(req, res, db, headers);
    } else if (req.method === "POST" && req.url.includes("/users/pet?pet=")) {
        return addPetImage(req, res, db, headers);
    } else if (req.method === "POST" && req.url.includes("/users/image?user=")) {
        return changeUserPhoto(req, res, db, headers);
    } else {
        res.writeHead(404, headers);
        res.end(`${req.url} is not here.`);
    }
};

module.exports = users;