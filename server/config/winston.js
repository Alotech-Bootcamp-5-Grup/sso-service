const winston = require('winston');
const winstonMysql = require('winston-mysql');

require('dotenv').config();

const options = {
  host : process.env.DB_HOST,
  user : process.env.DB_USER,
  password : process.env.DB_PASS,
  database :process.env.DB_NAME,
  table: 'logs'
};

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
