import mongoose from "mongoose";
import { DB_NAME } from "../constants.js";

const connectDB=async()=>{
    try {
       const connection=await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`) 
       console.log(`\n MONGODB connected DB Host:${connection.connection.host}`);
    } catch (err) {
       console.log("MONGODB connection error: ",err);
       process.exit(1);
    }
}

export default connectDB