const Busboy = require('busboy');
const crypto = require("crypto-js");
const fs = require("fs");

const axios = require("axios");

const {
    ObjectId
} = require("mongodb");

const processBody = req =>
    new Promise(resolve => {
        let body = "";

        req.on("data", function (data) {
            body += data;

            // Too much POST data, kill the connection!
            // 1e6 === 1 * Math.pow(10, 6) === 1 * 1000000 ~~~ 1MB
            if (body.length > 1e6) req.connection.destroy();
        });

        req.on("end", function () {
            resolve(JSON.parse(body));
        });
    });

const addImage = async (req, res, db, headers) => {
    try {
        const postId = req.url.split("post=")[1];

        const busboy = new Busboy({
            headers: req.headers
        });
        let filePath;

        busboy.on('file', function (fieldname, file, filename, encoding, mimetype) {
            const type = mimetype.split('/')[1];

            filePath = '/public/' + crypto.SHA512(new Date().toString()).toString() + `.${type}`;
            const saveTo = __dirname + '/../../client' + filePath;

            file.pipe(fs.createWriteStream(saveTo));
        });

        busboy.on('finish', async () => {
            await db.collection("posts").updateOne({
                _id: ObjectId(postId)
            }, {
                $set: {
                    photo: `/client${filePath}`
                }
            }, {
                upsert: true
            });

            res.writeHead(200, headers);
            return res.end(
                JSON.stringify({
                    success: true
                })
            );
        });

        req.pipe(busboy);
    } catch (error) {
        console.log(error);

        res.writeHead(500, headers);
        return res.end(
            JSON.stringify({
                success: false,
                message: "Something bad happen!"
            })
        );
    }
}

const createPost = async (req, res, db, headers) => {
    try {
        const token = req.url.split("user=")[1];
        const user = await db.collection("users").findOne({
            tokens: token
        });

        const body = await processBody(req);
        body.userId = user._id.toString();
        body.found = false;
        
        const address = await axios({
            method: "get",
            url: `https://api.opencagedata.com/geocode/v1/json?q=${body.lostLocation[0]}+${body.lostLocation[1]}&key=699cc2f867554ec6b8456095d8a5627a`
        });

        body.lostAddress = address.data.results[0].formatted;

        const post = await db.collection("posts").insertOne(body);

        if (user.posts) {
            user.posts.push(post.ops[0]._id.toString());
        } else {
            user.posts = [post.ops[0]._id.toString()];
        }

        await db.collection("users").updateOne({
            email: user.email
        }, {
            $set: {
                posts: user.posts
            }
        }, {
            upsert: true
        });

        const allUsers = await db.collection("users").find({});

        for (let index = 0; index < allUsers.length; index++) {
            const usr = allUsers[index];

            if (usr.email !== user.email) {
                if ((usr.currentLocation[0] > post.lostLocation[0] - 0.5 && usr.currentLocation[0] < post.lostLocation[0] + 0.5) || (usr.currentLocation[1] > post.lostLocation[1] - 0.5 && usr.currentLocation[1] < post.lostLocation[1] + 0.5)) {
                    await db.collection("notifications").insertOne({
                        userId: usr._id.toString(),
                        message: "Someone lost a pet near you.",
                        postId: post._id.toString(),
                        hostId: user._id.toString()
                    });
                }
            }
        }

        res.writeHead(201, headers);
        return res.end(
            JSON.stringify({
                success: true,
                postId: post.ops[0]._id.toString()
            })
        );
    } catch (error) {
        res.writeHead(500, headers);
        return res.end(
            JSON.stringify({
                success: false,
                message: "Something bad happened!"
            })
        );
    }
};

module.exports = {
    createPost,
    addImage
};