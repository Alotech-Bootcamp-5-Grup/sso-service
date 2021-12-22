// const session = require("express-session");
// const crypto = require('crypto');

// const salt = 'aloth_btcmp';
// const hash = crypto.createHmac('sha256', salt);


const db = require('../config/database');



exports.login = async (req, res) => {
    const username = req.body.username;
    // const password = req.body.password;

    try {
        db.query(`select user_password from users where username = ${db.escape(username)}`, (error, result) => {
            console.log(result[0]);
            res.status(200).json(result[0]);

        });
        
    } catch (error) {
        res.status(400).send(error);
        
    }

}
