const express = require("express");
const cors = require("cors");
const authRoute = require("./routes/routes");
const logger = require("./config/winston");
const createLogTable = require("./config/logTable");

require("dotenv").config();

const PORT = process.env.PORT;
const app = express();

// middlewares
app.use(express.json());
app.use(cors());

// routes
app.use("/", authRoute);

// app listen after database table created
createLogTable(()=>{
  app.listen(PORT, () => {
    logger.debug('sys', {message: `Server started on port ${PORT}`, type: 'sso'})
  });
});
