import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { User } from "../models/user.model.js";
const registerUser=asyncHandler(async (req,res)=>{
   const {fullname,username,email,password} =req.body
   if ([fullname,username,email,password].some((field)=>field?.trim()==="")) {
    throw new ApiError(400,"All fields are required") 
   } 
   const existed_user=User.findOne({
    $or:[{username},{email}]
   })
   if (existed_user) {
    throw new ApiError(409,"User with email or username exist") 
   }
   const avatar_local_path=req.files?.avatar[0]?.path;
   const cover_image_path=req.files?.coverImage[0]?.path;
   if (!avatar_local_path) {
        throw new ApiError(400,"Avatar is required"); 
   }

   User.create({
    fullname,
    coverImage,
    email,
    password,
    username:username.toLowerCase()
   })
    console.log(username);
}) 

export {registerUser}