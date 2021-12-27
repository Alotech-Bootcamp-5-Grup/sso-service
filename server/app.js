const express = require("express");
const cors = require("cors");
const authRoute = require("./routes/routes");

require("dotenv").config();

const PORT = process.env.PORT;
const app = express();
app.use(express.json());

app.use(cors());
app.use("/", authRoute);

app.listen(PORT, () => {
  console.log(`Server started on port ${PORT}`);
// app listen after database table created
createLogTable(()=>{
  app.listen(PORT, () => {
    logger.debug('sys', {message: `Server started on port ${PORT}`, type: 'sso'})
  });
});
