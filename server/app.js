const express = require("express");
const authRoute = require('./routes/routes');

require('dotenv').config();

const PORT = process.env.PORT;
const app = express();
app.use(express.json());

app.use('/', authRoute);


app.listen(PORT, ()=>{
    console.log(`Server started on port ${PORT}`)
})