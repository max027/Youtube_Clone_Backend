import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { User } from "../models/user.model.js";
import { ApiResponse } from "../utils/ApiResponse.js";
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

   const user=await User.create({
    fullname,
    coverImage,
    email,
    password,
    username:username.toLowerCase()
   })
    console.log(username);
    const created_user=await User.findById(user._id).select(
     "-password -refereshToken"
    );

    if (!created_user) {
     throw new ApiError(500,"Something went wrong while registering user"); 
    }

    return res.status(201).json(new ApiResponse(200,created_user,"User Registered sucessfully"))
}) 

export {registerUser}