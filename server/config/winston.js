const winston = require('winston');
const winstonMysql = require('winston-mysql');

require('dotenv').config();

// veritabanı (mysql) bağlantı ayarları
const options = {
  host : process.env.DB_HOST,
  user : process.env.DB_USER,
  password : process.env.DB_PASS,
  database :process.env.DB_NAME,
  table: 'logs'
};

// winston paketi ile serverda yapılan işlemlerin logları 
// alınıp bunları veritabanına yazan metodun gerçekleştirimi
const logger = winston.createLogger({
  level: process.env.DEBUG_MODE,
  format: winston.format.json(),
  defaultMeta: { service: 'user-service' },
  transports: [
    new winston.transports.Console({
      format: winston.format.simple(),
    }),
    new winstonMysql(options),
  ],
});

module.exports = logger;
