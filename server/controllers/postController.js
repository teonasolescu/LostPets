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

const getMyLost = async (req, res, db, headers) => {
    try {
        const token = req.url.split("user=")[1];

        const user = await db.collection("users").findOne({
            tokens: token
        });

        const posts = await db.collection("posts").find({
            userId: user._id.toString(),
            found: false
        }).sort({
            timestamp: 1
        }).toArray();

        res.writeHead(200, headers);
        return res.end(
            JSON.stringify({
                success: true,
                posts: posts
            })
        );
    } catch (error) {
        res.writeHead(500, headers);
        return res.end(
            JSON.stringify({
                success: false,
                message: "Something bad happen!"
            })
        );
    }
}

const getFound = async (req, res, db, headers) => {
    try {
        const posts = await db.collection("posts").find({
            found: true
        }).sort({
            timestamp: 1
        }).toArray();

        for (let index = 0; index < posts.length; index++) {
            let post = posts[index];

            const postUser = await db.collection("users").findOne({
                _id: ObjectId(post.userId)
            });

            delete postUser.password;
            delete postUser.tokens;

            post.user = postUser;
        }

        res.writeHead(200, headers);
        return res.end(
            JSON.stringify({
                success: true,
                posts: posts
            })
        );
    } catch (error) {
        res.writeHead(500, headers);
        return res.end(
            JSON.stringify({
                success: false,
                message: "Something bad happen!"
            })
        );
    }
}

const getAnotherLost = async (req, res, db, headers) => {
    try {
        const token = req.url.split("user=")[1];

        const user = await db.collection("users").findOne({
            tokens: token
        });

        const posts = await db.collection("posts").find({
            userId: {
                $ne: user._id.toString()
            },
            found: false
        }).sort({
            timestamp: 1
        }).toArray();

        for (let index = 0; index < posts.length; index++) {
            let post = posts[index];

            const postUser = await db.collection("users").findOne({
                _id: ObjectId(post.userId)
            });

            delete postUser.password;
            delete postUser.tokens;

            post.user = postUser;
        }

        res.writeHead(200, headers);
        return res.end(
            JSON.stringify({
                success: true,
                posts: posts
            })
        );
    } catch (error) {
        res.writeHead(500, headers);
        return res.end(
            JSON.stringify({
                success: false,
                message: "Something bad happen!"
            })
        );
    }
}

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
        res.writeHead(500, headers);
        return res.end(
            JSON.stringify({
                success: false,
                message: "Something bad happen!"
            })
        );
    }
}

const foundPet = async (req, res, db, headers) => {
    try {
        const body = await processBody(req);

        const user = await db.collection("users").findOne({
            tokens: body.token
        });

        await db.collection("posts").updateOne({
            _id: ObjectId(body.postId)
        }, {
            $set: {
                found: true,
                foundBy: user._id.toString()
            }
        }, {
            upsert: true
        });

        await db.collection("users").updateOne({
            _id: user._id
        }, {
            $set: {
                nrFounds: user.nrFounds + 1
            }
        }, {
            upsert: true
        });

        const post = await db.collection("posts").findOne({
            _id: ObjectId(body.postId)
        });

        const allUsers = await db.collection("users").find({}).toArray();

        for (let index = 0; index < allUsers.length; index++) {
            const usr = allUsers[index];

            if (usr.email !== user.email) {
                if ((usr.currentLocation[0] > post.lostLocation[0] - 0.5 && usr.currentLocation[0] < post.lostLocation[0] + 0.5) || (usr.currentLocation[1] > post.lostLocation[1] - 0.5 && usr.currentLocation[1] < post.lostLocation[1] + 0.5)) {
                    await db.collection("notifications").insertOne({
                        userId: usr._id.toString(),
                        message: "Someone found a pet near you.",
                        postId: post._id.toString(),
                        hostId: user._id.toString(),
                        timestamp: new Date().valueOf(),
                        seen: false
                    });
                }
            }
        }

        res.writeHead(200, headers);
        return res.end(
            JSON.stringify({
                success: true
            })
        );
    } catch (error) {
        res.writeHead(500, headers);
        return res.end(
            JSON.stringify({
                success: false,
                message: "Something bad happen!"
            })
        );
    }
}

const createReview = async (req, res, db, headers) => {
    try {
        const body = await processBody(req);

        const address = await axios({
            method: "get",
            url: `https://api.opencagedata.com/geocode/v1/json?q=${body.currentLatLng[0]}+${body.currentLatLng[1]}&key=699cc2f867554ec6b8456095d8a5627a`
        });

        const user = await db.collection("users").findOne({
            tokens: body.token
        });

        let review = {
            address: address.data.results[0].formatted,
            userId: user._id.toString(),
            postId: body.postId,
            timestamp: new Date().valueOf(),
            latLng: body.currentLatLng
        }

        const newReview = await db.collection("reviews").insertOne(review);

        const post = await db.collection("posts").findOne({
            _id: ObjectId(body.postId)
        });

        post.reviews.push(newReview.ops[0]._id.toString());

        await db.collection("posts").updateOne({
            _id: ObjectId(body.postId)
        }, {
            $set: {
                reviews: post.reviews
            }
        }, {
            upsert: true
        });

        const allUsers = await db.collection("users").find({}).toArray();

        for (let index = 0; index < allUsers.length; index++) {
            const usr = allUsers[index];

            if (usr.email !== user.email) {
                if ((usr.currentLocation[0] > post.lostLocation[0] - 0.5 && usr.currentLocation[0] < post.lostLocation[0] + 0.5) || (usr.currentLocation[1] > post.lostLocation[1] - 0.5 && usr.currentLocation[1] < post.lostLocation[1] + 0.5)) {
                    await db.collection("notifications").insertOne({
                        userId: usr._id.toString(),
                        message: "Someone saw a pet near you.",
                        postId: post._id.toString(),
                        hostId: user._id.toString(),
                        timestamp: new Date().valueOf(),
                        seen: false
                    });
                }
            }
        }

        res.writeHead(201, headers);
        return res.end(
            JSON.stringify({
                success: true
            })
        );
    } catch (error) {
        res.writeHead(500, headers);
        return res.end(
            JSON.stringify({
                success: false,
                message: "Something bad happen!"
            })
        );
    }
}

const getFoundMine = async (req, res, db, headers) => {
    try {
        const token = req.url.split("user=")[1];
        let user = await db.collection("users").findOne({
            tokens: token
        });

        const posts = await db.collection("posts").find({
            foundBy: user._id.toString()
        }).toArray();

        for (let index = 0; index < posts.length; index++) {
            let post = posts[index];

            const postUser = await db.collection("users").findOne({
                _id: ObjectId(post.userId)
            });

            delete postUser.password;
            delete postUser.tokens;

            post.user = postUser;
        }

        res.writeHead(200, headers);
        return res.end(
            JSON.stringify({
                success: true,
                posts
            })
        );
    } catch (error) {
        res.writeHead(500, headers);
        return res.end(
            JSON.stringify({
                success: false,
                message: "Something bad happen!"
            })
        );
    }
}

const getPost = async (req, res, db, headers) => {
    try {
        const postId = req.url.split("post=")[1];
        let post = await db.collection("posts").findOne({
            _id: ObjectId(postId)
        });

        let reviews = [];

        for (let index = 0; index < post.reviews.length; index++) {
            const reviewId = post.reviews[index];

            const review = await db.collection("reviews").findOne({
                _id: ObjectId(reviewId)
            });

            const userReview = await db.collection("users").findOne({
                _id: ObjectId(review.userId)
            });

            review.user = userReview;

            reviews.push(review);
        }

        reviews.sort((a, b) => b.timestamp - a.timestamp);

        post.reviews = reviews;

        res.writeHead(200, headers);
        return res.end(
            JSON.stringify({
                success: true,
                post
            })
        );
    } catch (error) {
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
        body.timestamp = new Date().valueOf();

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

        const allUsers = await db.collection("users").find({}).toArray();

        for (let index = 0; index < allUsers.length; index++) {
            const usr = allUsers[index];

            if (usr.email !== user.email) {
                if ((usr.currentLocation[0] > post.ops[0].lostLocation[0] - 0.5 && usr.currentLocation[0] < post.ops[0].lostLocation[0] + 0.5) || (usr.currentLocation[1] > post.ops[0].lostLocation[1] - 0.5 && usr.currentLocation[1] < post.ops[0].lostLocation[1] + 0.5)) {
                    await db.collection("notifications").insertOne({
                        userId: usr._id.toString(),
                        message: "Someone lost a pet near you.",
                        postId: post.ops[0]._id.toString(),
                        hostId: user._id.toString(),
                        timestamp: new Date().valueOf(),
                        seen: false
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
                message: "Something bad happen!"
            })
        );
    }
};

module.exports = {
    createPost,
    addImage,
    getMyLost,
    getAnotherLost,
    getFound,
    getPost,
    createReview,
    foundPet,
    getFoundMine
};