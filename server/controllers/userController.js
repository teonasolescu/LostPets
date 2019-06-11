const uuid = require("uuid/v4");

const Busboy = require('busboy');
const crypto = require("crypto-js");
const fs = require("fs");

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

const getUsers = async (req, res, db, headers) => {
    res.writeHead(200, headers);
    res.end(JSON.stringify([]));
};

const getUser = async (req, res, db, headers) => {
    try {
        const token = req.url.split("user=")[1];
        const user = await db.collection("users").findOne({
            tokens: token
        });

        delete user.password;
        delete user.tokens;

        res.writeHead(200, headers);
        return res.end(
            JSON.stringify({
                success: true,
                user
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

const changeUserPhoto = async (req, res, db, headers) => {
    try {
        const token = req.url.split("user=")[1];

        const user = await db.collection("users").findOne({
            tokens: token
        });

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
            await db.collection("users").updateOne({
                email: user.email
            }, {
                $set: {
                    profilePhoto: `/client${filePath}`
                }
            }, {
                upsert: true
            });

            res.writeHead(200, headers);
            return res.end(
                JSON.stringify({
                    success: true,
                    photo: `/client${filePath}`
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

const createPet = async (req, res, db, headers) => {
    try {
        const token = req.url.split("user=")[1];
        const body = await processBody(req);

        const user = await db.collection("users").findOne({
            tokens: token
        });

        body.userId = user._id.toString();
        body.timestamp = new Date().valueOf();

        const pet = await db.collection("pets").insertOne(body);

        res.writeHead(201, headers);
        return res.end(
            JSON.stringify({
                success: true,
                petId: pet.ops[0]._id.toString()
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

const addPetImage = async (req, res, db, headers) => {
    try {
        const petId = req.url.split("pet=")[1];

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
            await db.collection("pets").updateOne({
                _id: ObjectId(petId)
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

const changeUser = async (req, res, db, headers) => {
    try {
        const body = await processBody(req);
        const token = req.url.split("user=")[1];

        if (body.email) {
            const existingUser = await db
                .collection("users")
                .findOne({
                    email: body.email
                });

            if (existingUser && !existingUser.tokens.includes(token)) {
                res.writeHead(409, headers);
                return res.end(
                    JSON.stringify({
                        success: false,
                        message: "An user with this email already exists."
                    })
                );
            }
        }

        body.currentLocation = [47.151726, 27.587914];

        await db.collection("users").updateOne({
            tokens: token
        }, {
            $set: body
        }, {
            upsert: true
        });

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
};

const loginUser = async (req, res, db, headers) => {
    try {
        const body = await processBody(req);

        const existingUser = await db
            .collection("users")
            .findOne({
                email: body.email,
                password: body.password
            });

        if (!existingUser) {
            res.writeHead(404, headers);
            return res.end(
                JSON.stringify({
                    success: false,
                    message: "An user with this email doesn't exist."
                })
            );
        } else {
            const token = uuid();
            const {
                tokens
            } = existingUser;
            tokens.push(token);

            await db.collection("users").updateOne({
                email: existingUser.email
            }, {
                $set: {
                    tokens,
                    currentLocation: [47.151726, 27.587914]
                }
            }, {
                upsert: true
            });

            delete existingUser.password;
            delete existingUser.tokens;

            res.writeHead(200, headers);
            return res.end(
                JSON.stringify({
                    success: true,
                    user: existingUser,
                    token: token
                })
            );
        }
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

const getPets = async (req, res, db, headers) => {
    try {
        const token = req.url.split("user=")[1];

        const user = await db.collection("users").findOne({
            tokens: token
        });

        const pets = await db.collection("pets").find({
            userId: user._id.toString()
        }).toArray();

        res.writeHead(200, headers);
        return res.end(
            JSON.stringify({
                success: true,
                pets
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

const createUser = async (req, res, db, headers) => {
    try {
        const body = await processBody(req);

        const existingUser = await db
            .collection("users")
            .findOne({
                email: body.email
            });

        if (existingUser) {
            res.writeHead(409, headers);
            return res.end(
                JSON.stringify({
                    success: false,
                    message: "An user with this email already exist."
                })
            );
        } else {
            const token = uuid();
            body.tokens = [token];
            body.profilePhoto =
                "https://t4.ftcdn.net/jpg/02/15/84/43/240_F_215844325_ttX9YiIIyeaR7Ne6EaLLjMAmy4GvPC69.jpg";
            body.nrFounds = 0;
            body.currentLocation = [47.151726, 27.587914];

            const user = await db.collection("users").insertOne(body);
            delete user.ops[0].password;
            delete user.ops[0].tokens;

            res.writeHead(201, headers);
            return res.end(
                JSON.stringify({
                    success: true,
                    user: user.ops[0],
                    token
                })
            );
        }
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
    getUsers,
    createUser,
    loginUser,
    getUser,
    changeUser,
    changeUserPhoto,
    createPet,
    addPetImage,
    getPets
};