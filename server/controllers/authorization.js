const uuid = require('uuid');
const db = require('../config/database');


exports.login = async (req, res) => {
    const username = req.body.username;
    const password = req.body.user_password;

    const user_ip = req.socket.remoteAddress;
    
    try {
        db.query(`select user_password from users where username = ${db.escape(username)}`, (error, result) => {
            console.log(result[0]['user_password']);
            
            if (password == result[0]['user_password']) {
                const uniqueToken = generateUniqueToken(3, user_ip);

                if (uniqueToken.status == "success") {
                    res.status(200).json(uniqueToken.token);
                } else {
                    res.status(400).json({message: "something is wrong"});
                }
            } else {
                res.status(400).json({message: "password is wrong"});
            }
        });              
    } catch (error) {
        res.status(400).send(error);
    }
}
// eger login basarili ise token olusturulacak
var generateUniqueToken = (user_id, user_ip) => {
    
    const token = uuid.v4(); 
    const url = JSON.stringify(["localhost:3000","localhost:3000"]); 
    
    const ttl = new Date(); //gun olarak vermeliyiz yada dakika vs
    const createdAt = new Date();

    const sqlQuery = `INSERT INTO tokens (url, token, ttl, user_id, user_ip, createdAt) VALUES (${db.escape(url)}, ${db.escape(token)}, ${db.escape(ttl)}, ${db.escape(user_id)}, ${db.escape(user_ip)}, ${db.escape(createdAt)})`;
    
    db.query(sqlQuery, (err, result) => {
        if (err) return {"status": "error", err};       
        console.log("token db'ye eklendi.");
    
    })
    
    return {"status": "success", token};
    
    hasExpired = function() {
        const now = Date.now();
        var expireDate = createdAt.setDate( createdAt.getDate() + ttl);
        if (now < expireDate) {
            // eger expire olmamissa
            // bu token kullanilabilir.

        } else {
            // expire olmussa

        }
    }
}
