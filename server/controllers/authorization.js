const uuid = require("uuid");
const bcrypt = require('bcrypt');
const db = require("../config/database");
const logger = require("../config/winston")

require("dotenv").config();

exports.isAuthorized = async (req, res) => {
  const { redirectURL } = req.query;
  if (!redirectURL) {
    logger.warn('missing url', {message: `${req.method} - ${req.socket.remoteAddress} - ${req.url} - 400 -`, type: 'sso'})
    return res
      .status(400)
      .json({ message: "No redirectURL specified" });
  }
  const url = new URL(redirectURL);
  if (!JSON.parse(process.env.URLS).includes(url.origin)) {
    logger.warn('wrong url', {message: `${req.method} - ${req.socket.remoteAddress} - ${req.url} - 400 -`, type: 'sso'})
    return res
      .status(400)
      .json({ message: "RedirectURL is wrong" }); // burada wrong demek yerine user is not allowed demek daha iyi olur.
  }
  const username = req.body.username;
  const password = req.body.user_password;
  const user_ip = req.socket.remoteAddress;

  db.promise()
    .query(
      `select id, user_password, user_type from users where username = ${db.escape(
        username
      )}`
    )
    .then(([result, fields]) => {
      const user_id = result[0]["id"]
      const user_type = result[0]["user_type"]
      bcrypt.compare(password, result[0]["user_password"]).then(
        (valid) => {
          if (!valid) {
            logger.warn('wrong password', {message: `${req.method} - ${req.socket.remoteAddress} - ${req.url} - 401 -`, type: 'sso'})
            return res.status(401).json({
              message: 'Incorrect password!'
            });
          }
          generateUniqueToken(req, res, user_id, user_ip, user_type);
        }
      )
    })
    .catch((err) => {
      logger.error('database error', {message: `${req.method} - ${req.socket.remoteAddress} - ${req.url} - 500 -`, type: 'sso'})
      res.status(500).json({ response: false });
    });
};

exports.isAccessTokenValid = function (req, res) {
  const { redirectURL } = req.query;
  if (!redirectURL) {
    logger.warn('missing url', {message: `${req.method} - ${req.socket.remoteAddress} - ${req.url} - 400 -`, type: 'sso'})
    return res
      .status(400)
      .json({ message: "No redirectURL specified" });
  }
  const url = new URL(redirectURL);
  const now = new Date();
  const token = req.headers["x-access-token"];
  const user_ip = req.socket.remoteAddress;

  db.promise()
    .query(`SELECT tokens.*, users.user_type as user_type FROM users JOIN tokens ON users.id = tokens.user_id AND tokens.token=${db.escape(token)}`)
    .then(([result, fields]) => {
      const ttl = result[0]["ttl"];
      const createdAt = result[0]["createdAt"];
      const createdAtTime = createdAt.getTime();
      const expireTime = createdAtTime + ttl;

      const allowedUrls = result[0]["url"];
      const allowedIp = result[0]["user_ip"];
      if (!allowedUrls.includes(url.origin)) {
        logger.warn('wrong url', {message: `${req.method} - ${req.socket.remoteAddress} - ${req.url} - 400 -`, type: 'sso'})
        return res
          .status(400)
          .json({ message: "Wrong redirectURL" });
      }
      /* console.log(allowedIp,"||" ,user_ip)
      if (allowedIp !== user_ip) {
        logger.warn('diffrent ip', {message: `${req.method} - ${req.socket.remoteAddress} - ${req.url} - 400 -`, type: 'sso'})
        return res
          .status(400)
          .json({ message: "Unknown IP adress" });
      } */
      const expireDate = new Date(expireTime);

      if (now < expireDate) {
        const user_type =result[0]["user_type"]
        const user_id =result[0]["user_id"]
        logger.debug('user login', {message: `${req.method} - ${req.socket.remoteAddress} - ${req.url} - 200 -`, type: 'sso'})
        res.status(200).json({ response: true, user_id, user_type });
      } else {
        const user_id = result[0]["user_id"];
        const user_ip = req.socket.remoteAddress;
        generateUniqueToken(req, res, user_id, user_ip, user_type);
      }
    })
    .catch((err) => {
      logger.warn('invalid token', {message: `${req.method} - ${req.socket.remoteAddress} - ${req.url} - 400 -`, type: 'sso'})
      res.status(400).json({ response: false, "message":"token is invalid" });
    });
};

const generateUniqueToken = (req, res, user_id, user_ip, user_type) => {
  const Access_Token = uuid.v4();
  const url = process.env.URLS;

  const createdAt = new Date();
  // TTL = 1 day
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
      logger.debug('token created', {message: `${req.method} - ${req.socket.remoteAddress} - ${req.url} - 200 -`, type: 'sso'})
      res.status(200).json({ response: true, user_id, Access_Token, user_type });
    })
    .catch((err) => {
      logger.warn('database error', {message: `${req.method} - ${req.socket.remoteAddress} - ${req.url} - 500 -`, type: 'sso'})
      res.status(500).json({ response: false, "message":"problem occured while access token being generated" });
    });
};
