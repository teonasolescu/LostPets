const {
    createPost,
    addImage
} = require("../controllers/postController");

const users = (req, res, db, headers) => {
    if (req.method === "POST" && req.url.includes("/posts?user=")) {
        return createPost(req, res, db, headers);
    } else if (req.method === "POST" && req.url.includes("/posts?post=")) {
        return addImage(req, res, db, headers);
    } else {
        res.writeHead(404, headers);
        return res.end(`${req.url} is not here.`);
    }
};

module.exports = users;