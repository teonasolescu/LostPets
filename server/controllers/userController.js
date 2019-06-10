const uuid = require("uuid/v4");

//proceseaza date de la client la server
const processBody = req =>
    new Promise(resolve => {
        let body = "";

        req.on("data", function(data) {
            body += data;

            // Too much POST data, kill the connection!
            // 1e6 === 1 * Math.pow(10, 6) === 1 * 1000000 ~~~ 1MB
            if (body.length > 1e6) req.connection.destroy();
        });

        req.on("end", function() {
            resolve(JSON.parse(body));
        });
    });

const getUsers = async (req, res, db, headers) => {
    res.writeHead(200, headers);
    res.end(JSON.stringify([]));
};

const loginUser = async (req, res, db, headers) => {
    try {
        const body = await processBody(req);

        const existingUser = await db
            .collection("users")
            .findOne({ email: body.email, password: body.password });

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
            const { tokens } = existingUser;
            tokens.push(token);

            await db.collection("users").updateOne(
                { email: existingUser.email },
                {
                    $set: {
                        tokens
                    }
                },
                { upsert: true }
            );

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

const createUser = async (req, res, db, headers) => {
    try {
        const body = await processBody(req);

        const existingUser = await db
            .collection("users")
            .findOne({ email: body.email });

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
    loginUser
};
