require("dotenv").config({quiet : true});
const mongoose = require("mongoose");
const app = require("./app");

mongoose.connect(process.env.DB_URI)
    .then(() => {
    
        console.log("Database Connected Successfully");

        app.listen(process.env.PORT, () => {
            console.log(`Server Started on ${process.env.PORT}`)
        })
    }).catch((error) => {
        console.log("DB Error", error);
    });