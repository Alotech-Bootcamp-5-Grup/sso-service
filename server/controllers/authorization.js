const uuid = require("uuid");
const db = require("../config/database");
require("dotenv").config();
const bcrypt = require('bcrypt');

exports.isAuthorized = async (req, res) => {
  const { redirectURL } = req.query;
  // direct access will give the error inside new URL.
  if (redirectURL != null) {
    const url = new URL(redirectURL);
    if (!JSON.parse(process.env.URLS).includes(url.origin)) {
      return res
        .status(400)
        .json({ message: "Your are not allowed to access the sso-server" });
    }
  }
  const username = req.body.username;
  // hashli password gelecek
  const password = req.body.user_password;
  const user_ip = req.socket.remoteAddress;

  db.promise()
    .query(
      `select user_password, id from users where username = ${db.escape(
        username
      )}`
    )
    .then(([result, fields]) => {
      bcrypt.compare(password, result[0]["user_password"]).then(
        (valid) => {
          if (!valid) {
            return res.status(401).json({
              error: new Error('Incorrect password!')
            });
          }
          generateUniqueToken(res, result[0]["id"], user_ip);
        }
      ) 
    })
    .catch((err) => {
      res.status(400).json({ response: false });
    });
    
};

const generateUniqueToken = (res, user_id, user_ip) => {
  const Access_Token = uuid.v4();
  const url = process.env.URLS;

  const createdAt = new Date();
  // TTL = 1 day // 86400000
  const ttl = 86400000;
  // TTL = 1 minute
  // const ttl = 60000;

  const sqlQuery = `INSERT INTO tokens (url, token, ttl, user_id, user_ip, createdAt) VALUES (${db.escape(
    url
  )}, ${db.escape(Access_Token)}, ${db.escape(ttl)}, ${db.escape(
    user_id
  )}, ${db.escape(user_ip)}, ${db.escape(createdAt)})`;

  db.promise()
    .query(sqlQuery)
    .then(() => {
      res.status(200).json({ response: true, user_id, Access_Token });
    })
    .catch((err) => {
      res.status(400).json({ response: false });
    });
};

exports.isAccessTokenValid = function (req, res) {
  // const url = req.protocol + "://" + req.get("host");
  const { redirectURL } = req.query;
  const url = new URL(redirectURL);
  console.log(url.origin);
  const now = new Date();
  const token = req.body.token;
  const user_ip = req.socket.remoteAddress;

  db.promise()
    .query(`select * from tokens where token = ${db.escape(token)}`)
    .then(([result, fields]) => {
      const ttl = result[0]["ttl"];
      // console.log("ttl" + ttl)
      const createdAt = result[0]["createdAt"];
      const createdAtTime = createdAt.getTime();
      const expireTime = createdAtTime + ttl;

      const allowedUrls = result[0]["url"];
      const allowedIp = result[0]["user_ip"];
      if (!allowedUrls.includes(url.origin)) {
        return res
          .status(400)
          .json({ message: "Your are not allowed to access the sso-server" });
      }
      if (allowedIp !== user_ip) {
        return res
          .status(400)
          .json({ message: "Your are not allowed to access the sso-server" });
      }
      console.log("expireTime" + expireTime);
      const expireDate = new Date(expireTime);
      
      
      if (now < expireDate) {
        res.status(200).json({ response: true });
      } else {
        const user_id = result[0]["user_id"];
        const user_ip = req.socket.remoteAddress;

        console.log("expired");
        generateUniqueToken(res, user_id, user_ip);
      }
    })
    .catch((err) => {
      res.status(400).json({ response: false });
    });
};






// // const uuid = require("uuid");
// const db = require("../config/database");
// const jwt = require('jsonwebtoken');
// require("dotenv").config();
// const bcrypt = require('bcrypt');

// exports.isAuthorized = async (req, res) => {
//   const { redirectURL } = req.query;
//   // direct access will give the error inside new URL.
//   if (redirectURL != null) {
//     const url = new URL(redirectURL);
//     if (!JSON.parse(process.env.URLS).includes(url.origin)) {
//       return res
//         .status(400)
//         .json({ message: "Your are not allowed to access the sso-server" });
//     }
//   }

//   const username = req.body.username;
//   const password = req.body.user_password;
//   const user_ip = req.socket.remoteAddress;

//   db.promise()
//     .query(
//       `select user_password, id from users where username = ${db.escape(
//         username
//       )}`
//     )
//     .then(([result, fields]) => {
//       bcrypt.compare(password, result[0]["user_password"]).then(
//         (valid) => {
//           if (!valid) {
//             return res.status(401).json({
//               error: new Error('Incorrect password!')
//             });
//           }
//           generateUniqueToken(res, result[0]["id"], user_ip);
//         }
//       )
//     }).catch((err) => {
//       console.log(err);
//       res.status(400).json({ response: false });
//     });

// }

// const generateUniqueToken = (res, user_id, user_ip) => {
//   const createdAt = new Date();
//   // TTL = 1 day
//   const ttl = "1d";

//   const Access_Token = jwt.sign(
//     { userId: user_id },
//     process.env.jwt_private_key,
//     { expiresIn: ttl });

//   // const Access_Token = uuid.v4();
//   const url = process.env.URLS;

//   const sqlQuery = `INSERT INTO tokens (url, token, ttl, user_id, user_ip, createdAt) VALUES (${db.escape(
//     url
//   )}, ${db.escape(Access_Token)}, ${db.escape(ttl)}, ${db.escape(
//     user_id
//   )}, ${db.escape(user_ip)}, ${db.escape(createdAt)})`;

//   db.promise()
//     .query(sqlQuery)
//     .then(() => {
//       res.status(200).json({ response: true, user_id, Access_Token });
//     })
//     .catch((err) => {
//       res.status(400).json({ response: false });
//     });
// };

// exports.isAccessTokenValid = function (req, res) {
//   // const url = req.protocol + "://" + req.get("host");
//   const { redirectURL } = req.query;
//   const now = new Date();
//   const token = req.body.token;
//   const user_ip = req.socket.remoteAddress;
//   console.log(redirectURL)
//   db.promise()
//     .query(`select * from tokens where token = ${db.escape(token)}`)
//     .then(([result, fields]) => {

//       // let expireDate = new Date();
//       // const ttl = result[0]["ttl"];
//       // const createdAt = result[0]["createdAt"];
//       // const createdAtTime = createdAt.getTime();
//       // const expireTime = createdAtTime + ttl;

//       const allowedUrls = result[0]["url"];
//       const allowedIp = result[0]["user_ip"];

//       if (!allowedUrls.includes(redirectURL)) {
//         return res
//           .status(400)
//           .json({ message: "Your are not allowed to access the sso-server" });
//       }
//       /* if (allowedIp === user_ip) {
//         return res
//           .status(400)
//           .json({ message: "Your are not allowed to access the sso-server" });
//       } */
//       jwt.verify(token, process.env.jwt_private_key, function(err, decoded) {
//         if (err) {
//           const user_id = result[0]["user_id"];
//           const user_ip = req.socket.remoteAddress;
  
//           console.log("expired");
//           generateUniqueToken(res, user_id, user_ip);
//         }else{
//           res.status(200).json({ response: true });
//         }
//       });
//       // const expireDate = new Date(expireTime);
//       // console.log(expireDate);

//       // if (now < expireDate) {
//       //   
//       // } else {

//       // }
//     })
//     .catch((err) => {
//       res.status(400).json({ response: false });
//     });
// };
