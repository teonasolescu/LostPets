const {
    createPost,
    addImage,
    getMyLost,
    getAnotherLost,
    getFound,
    getPost,
    createReview,
    foundPet,
    getFoundMine
} = require("../controllers/postController");

const posts = (req, res, db, headers) => {
    if (req.method === "POST" && req.url.includes("/posts?user=")) {
        return createPost(req, res, db, headers);
    } else if (req.method === "POST" && req.url.includes("/posts?post=")) {
        return addImage(req, res, db, headers);
    } else if (req.method === "POST" && req.url === "/posts/review") {
        return createReview(req, res, db, headers);
    } else if (req.method === "GET" && req.url.includes("/posts?post=")) {
        return getPost(req, res, db, headers);
    } else if (req.method === "GET" && req.url.includes("/posts/my-lost?user=")) {
        return getMyLost(req, res, db, headers);
    } else if (req.method === "GET" && req.url.includes("/posts/found-mine?user=")) {
        return getFoundMine(req, res, db, headers);
    } else if (req.method === "GET" && req.url.includes("/posts/another-lost?user=")) {
        return getAnotherLost(req, res, db, headers);
    } else if (req.method === "GET" && req.url === "/posts/found") {
        return getFound(req, res, db, headers);
    } else if (req.method === "POST" && req.url === "/posts/found") {
        return foundPet(req, res, db, headers);
    } else {
        res.writeHead(404, headers);
        return res.end(`${req.url} is not here.`);
    }
};

module.exports = posts;