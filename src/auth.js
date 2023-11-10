const jwt = require('jsonwebtoken');
const dotEnv = require('dotenv');

const userSchema = require('../schema/customerDetailsSchema');

dotEnv.config();

//generate token for authentication

module.exports.createToken = (id) => {
    const sceretKey = process.env.JWT_SECRET;
    const token = jwt.sign({ id }, sceretKey, {
        expiresIn: 3 * 24 * 60 * 60
    });
    return token;
}

// validation of token authorisation

module.exports.verifyToken = (req, res, callBack) => {
    const token = req.cookies.token;
    if (!token) {
        return res.json({ Error: `Token Invalid` });
    }
    jwt.verify(token, process.env.JWT_SECRET, async (err, data) => {
        if (err) {
            return res.json({ Error: err });
        }
        else {
            const user = await userSchema.findById(data.id);

            if (user) {
                callBack();

            }
            else {
                return res.json({ error: `User Not Found` });
            }

        }
    })
}


/*Data of verify User */
module.exports.loginUserData = (req, res) => {
    token = req.cookies.token;
    if (!token) {
        return res.json({ message: `token not available` });
    }
    jwt.verify(token, process.env.JWT_SECRET, async (err, data) => {
        if (err) {
            return res.json({ ERROR: err })
        }
        else {
            const userData = await userSchema.findById(data.id);
            if (userData) {
                res.json(userData)
            }
            else {
                return res.json({ Error: `user not available` });
            }
        }
    })
}


