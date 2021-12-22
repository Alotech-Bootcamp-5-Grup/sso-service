const express = require("express");
const authRoute = require('./routes/routes');

const PORT = 3000;
const app = express();
app.use(express.json());

app.use('/', authRoute);


app.listen(PORT, ()=>{
    console.log(`Server started on port ${PORT}`)
})