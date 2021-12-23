const uuid = require('uuid');
const db = require('../config/database');


exports.isAuthorized = async (req, res) => {
    const username = req.body.username;
    // hashli password gelecek
    const password = req.body.user_password;

    const user_ip = req.socket.remoteAddress;

    db.promise().query(`select user_password, id from users where username = ${db.escape(username)}`)
    .then(([result, fields])=>{
      if (password == result[0]['user_password']) {
        generateUniqueToken(res, result[0]['id'], user_ip);
      } else {
        res.status(400).json({"response": false});
      }
    })
    .catch((err)=>{
      res.status(400).json({"response": false});
    })
}
// eger login basarili ise token olusturulacak
const generateUniqueToken = (res, user_id, user_ip) => {

    const Access_Token = uuid.v4();
    const url = JSON.stringify(["localhost:3000","localhost:3000"]);

    const createdAt = new Date();
    // TTL = 1 day
    // const ttl = new Date(86400000); 
    // TTL = 1 minute
    const ttl = 60000; 
    console.log(ttl);

    const sqlQuery = `INSERT INTO tokens (url, token, ttl, user_id, user_ip, createdAt) VALUES (${db.escape(url)}, ${db.escape(Access_Token)}, ${db.escape(ttl)}, ${db.escape(user_id)}, ${db.escape(user_ip)}, ${db.escape(createdAt)})`;

    db.promise().query(sqlQuery)
      .then(()=>{
        res.status(200).json({"response": true, user_id, Access_Token})
      })
      .catch((err)=>{
        res.status(400).json({"response": false})
      }) 
}

exports.isAccessTokenValid = function(req, res) {
    const now = new Date();
    const token = req.body.token;

    db.promise().query(`select * from tokens where token = ${db.escape(token)}`)
    .then(([result, fields])=>{
        // let expireDate = new Date();
        const ttl = result[0]['ttl'];
        const createdAt = result[0]['createdAt'];
        const createdAtTime = createdAt.getTime();
        const expireTime = createdAtTime + ttl;

        const expireDate = new Date(expireTime);
        console.log(expireDate);
        
        if (now < expireDate) {
            // eger expire olmamissa bu token kullanilabilir.
            console.log("hello");
            res.status(200).json({"response": true});
            
        } else {
            // expire olmussa
            const user_id = result[0]['user_id'];
            const user_ip = req.socket.remoteAddress;

            console.log("expired");
            generateUniqueToken(res, user_id, user_ip);

            
        }

    })
    .catch((err)=>{
      res.status(400).json({"response": false});
    })


    
}
