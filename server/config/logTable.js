const db = require('./database');
const logger = require("./winston")

let query = 'CREATE TABLE IF NOT EXISTS `logs` ( \
 `id` INT NOT NULL AUTO_INCREMENT, \
 `level` VARCHAR(16) NOT NULL, \
 `message` VARCHAR(2048) NOT NULL, \
 `meta` VARCHAR(2048) NOT NULL, \
 `timestamp` DATETIME NOT NULL, \
 PRIMARY KEY (`id`));'

const createLogTable = (callback) => {
  db.promise().query(query)
  .then(()=>{
    logger.debug('sys', {message: 'run createLogTable query', type: 'sso'})
  })
  .catch((err)=>{
    console.log(err)
  })
  .finally(()=>{
    callback();
  })
}

module.exports = createLogTable;
