const mongoose = require('mongoose');

const connectDB = async () => {
   try{
     await mongoose.connect(process.env.DB_URI);
     
    console.log("Database Connect Successfully");
   }
   catch(error){
    console.error("DB Error:", error);
    process.exit(1);
   }
}

module.exports = connectDB;