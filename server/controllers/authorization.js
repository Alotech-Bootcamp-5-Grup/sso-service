const uuid = require("uuid");
const bcrypt = require('bcrypt');
const db = require("../config/database");
const logger = require("../config/winston")

require("dotenv").config();


// Bu servisimizde kullanıcıyı authenticate ediyoruz. 
exports.isAuthorized = async (req, res) => {
  // url = http://localhost:3010/?redirectURL=http://localhost:3000
  // 11 satırda gösterildiği gibi auth servisimize böyle bir url geliyor 
  // bu url'in redirectUrl'ini alıyoruz ilk önce varmı yokmu bunu kontrol ediyor ve
  // eğer yoksa no redirectUrl specified diye bir uyarı mesajı döndürüyoruz
  const { redirectURL } = req.query;
  if (!redirectURL) {
    logger.warn('missing url', { message: `${req.method} - ${req.socket.remoteAddress} - ${req.url} - 400 -`, type: 'sso' })
    return res
      .status(400)
      .json({ message: "No redirectURL specified" });
  }

  //burada aldığımız redirectURL'url'i URL öbjesine vererek url bir çok parametresine ulaşıyoruz
  const url = new URL(redirectURL);

  // burada aldığımız redirectURL'in izin verilen url'ler arasında olup olmadığını kontrol ediyoruz
  if (!JSON.parse(process.env.URLS).includes(url.origin)) {
    logger.warn('wrong url', { message: `${req.method} - ${req.socket.remoteAddress} - ${req.url} - 400 -`, type: 'sso' })
    return res
      .status(400)
      .json({ message: "RedirectURL is wrong" }); // burada wrong demek yerine user is not allowed demek daha iyi olur.
  }

  //isAuthorized servisine istek attığımızda body'de verdiğimiz kullanıcı bilgilerini alıyoruz
  const username = req.body.username;
  const password = req.body.user_password;
  const user_ip = req.socket.remoteAddress;

  // burada authenticate etmek istediğimiz kullanıcı adını vererek veritabanında olup olmadığını ve 
  // eğer varsa diğer bilgilerini alıyoruz
  db.promise()
    .query(
      `select id, user_password, user_type from users where username = ${db.escape(
        username
      )}`
    )
    .then(([result, fields]) => {
      const user_id = result[0]["id"]
      const user_type = result[0]["user_type"]

      // authenticate etmek istediğimiz kullanıcının şifresi açık halde zaten elimizdeydi
      // hash'li halinide veritabanında alıp bycrypt kütüphanesi sayeseinde karşılaştırıyoruz
      // ve eğer bu şifreler birbirine eşit değil ise incorret password mesajı dönüyoruz fakat
      // eğer eşit ise bu kullanıcıya autheticate etmiş olduğu için generateUniqueToken fonksiyonu 
      // sayesinde token üretiyoruz
      bcrypt.compare(password, result[0]["user_password"]).then(
        (valid) => {
          if (!valid) {
            logger.warn('wrong password', { message: `${req.method} - ${req.socket.remoteAddress} - ${req.url} - 401 -`, type: 'sso' })
            return res.status(401).json({
              message: 'Incorrect password!'
            });
          }
          generateUniqueToken(req, res, user_id, user_ip, user_type);
        }
      )
    })
    .catch((err) => {
      logger.error('database error', { message: `${req.method} - ${req.socket.remoteAddress} - ${req.url} - 500 -`, type: 'sso' })
      res.status(500).json({ response: false });
    });
};

const generateUniqueToken = (req, res, user_id, user_ip, user_type) => {
  // burada uuid kütüphanesi ile bir random karakter oluşturup token olarak kullanıyoruz.
  const Access_Token = uuid.v4();

  //.env dosyasının içindeki izin verilen url'leri alıyoruz
  const url = process.env.URLS;

  // token'ın üretirldiği zamanı tutuyoruz.
  const createdAt = new Date();

  // TTL = 1 day | burada token'ın geçerlilik süresini belirliyoruz.
  const ttl = 86400000;

  // bu query ile oluşturulan token'ı veritabanına ekliyoruz.
  const sqlQuery = `INSERT INTO tokens (url, token, ttl, user_id, user_ip, createdAt) VALUES (${db.escape(
    url
  )}, ${db.escape(Access_Token)}, ${db.escape(ttl)}, ${db.escape(
    user_id
  )}, ${db.escape(user_ip)}, ${db.escape(createdAt)})`;

  db.promise()
    .query(sqlQuery)
    .then(() => {
      logger.debug('token created', { message: `${req.method} - ${req.socket.remoteAddress} - ${req.url} - 200 -`, type: 'sso' })
      res.status(200).json({ response: true, user_id, Access_Token, user_type });
    })
    .catch((err) => {
      logger.warn('database error', { message: `${req.method} - ${req.socket.remoteAddress} - ${req.url} - 500 -`, type: 'sso' })
      res.status(500).json({ response: false, "message": "problem occured while access token being generated" });
    });
};

// isAccessTokenValid servisi ile token'ın geçerli olup olmadığını kontrol ediyoruz.
exports.isAccessTokenValid = function (req, res) {
  // isAuthorized servisinde gösterildiği gibi redirectURL'i aynı şekilde alıp edip kontrollerini yapıyoruz
  const { redirectURL } = req.query;
  if (!redirectURL) {
    logger.warn('missing url', { message: `${req.method} - ${req.socket.remoteAddress} - ${req.url} - 400 -`, type: 'sso' })
    return res
      .status(400)
      .json({ message: "No redirectURL specified" });
  }
  const url = new URL(redirectURL);
  // geçerli olup olmadığını belirlemek için gönderilen token'ı bu şekilde header'dan alıyoruz.
  const token = req.headers["x-access-token"];

  // token'ın geçerlilik süresini karşılaştırmak için şimdiki zamanı tutuyoruz.
  const now = new Date();

  // header'dan alığımız token'ının diğer bilgilerini'de veri tabanında alıp geçerliliğini kontrol etmek için query yazıyoruz.
  db.promise()
    .query(`SELECT tokens.*, users.user_type as user_type FROM users JOIN tokens ON users.id = tokens.user_id AND tokens.token=${db.escape(token)}`)
    .then(([result, fields]) => {

      // veritabanından aldığımız token'ın diğer bilgilerini bu şekilde set ediyoruz.
      const ttl = result[0]["ttl"];
      const createdAt = result[0]["createdAt"];

      // burada token'ın ne zaman oluşturulduğunu tutuyoruz.
      const createdAtTime = createdAt.getTime();

      // burada geçerlilik süresi ile oluşturulma süresini toplayarak expireTime'ı buluyoruz.
      const expireTime = createdAtTime + ttl;

      // bu token'a ait izin verilen url'leri set ediyoruz.
      const allowedUrls = result[0]["url"];

      // isAccessTokenValid servisine gönderilen redirectURL'in izin verieln url'ler arasında olup olmadığını kontrol ediyoruz.
      if (!allowedUrls.includes(url.origin)) {
        logger.warn('wrong url', { message: `${req.method} - ${req.socket.remoteAddress} - ${req.url} - 400 -`, type: 'sso' })
        return res
          .status(400)
          .json({ message: "Wrong redirectURL" });
      }
      const expireDate = new Date(expireTime);

      // burada bulduğumuz expireTime'ın şimdiki zamandan küçük mü büyükmü olduğunu kontrol ediyoruz
      // eğer expireTime şimdiki zamandan daha büyükse demmekki token expire olmamış ama eğer küçükse expire olmuş demektir.
      if (now < expireDate) {
        // eğer token expire olmamış ise response olarak true dönüdüyoruz ve  access token valid'diye bir log basıyoruz veritabanına
        const user_type = result[0]["user_type"]
        const user_id = result[0]["user_id"]
        logger.debug('acces token valid', { message: `${req.method} - ${req.socket.remoteAddress} - ${req.url} - 200 -`, type: 'sso' })
        res.status(200).json({ response: true, user_id, user_type });
      } else {
        // eğer token expire olmuş ise yeni bir token üretiyoruz.
        const user_id = result[0]["user_id"];
        const user_ip = req.socket.remoteAddress;
        generateUniqueToken(req, res, user_id, user_ip, user_type);
      }
    })
    .catch((err) => {
      logger.warn('invalid token', { message: `${req.method} - ${req.socket.remoteAddress} - ${req.url} - 400 -`, type: 'sso' })
      res.status(400).json({ response: false, "message": "token is invalid" });
    });
};
