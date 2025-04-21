import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { User } from "../models/user.model.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import jwt from "jsonwebtoken";

const generateAccessandRefreshToken=async(userId)=>{
  try {
   const user=await User.findById(userId); 
   const access_token=user.generateAccessToken();
   const refresh_token=user.generateRefreshToken();
   user.refreshToken=refresh_token;
   await user.save({validateBeforeSave:false});

    return {access_token,refresh_token};
  } catch (error) {
    throw new ApiError(500,"Something went wrong while generating access or refresh token");
  }
}

const registerUser=asyncHandler(async (req,res)=>{
   const {fullname,username,email,password} =req.body
   if ([fullname,username,email,password].some((field)=>field?.trim()==="")) {
    throw new ApiError(400,"All fields are required") 
   } 
   const existed_user=await User.findOne({
    $or:[{username},{email}]
   })
   if (existed_user) {
    throw new ApiError(409,"User with email or username exist") 
   }
   /**  
   const avatar_local_path=req.files?.avatar[0]?.path;
   const cover_image_path=req.files?.coverImage[0]?.path;
   if (!avatar_local_path) {
        throw new ApiError(400,"Avatar is required"); 
   }
  
   let coverImageLocalPath;
   if(req.files && Array.isArray(req.files.coverImage) && req.files.coverImage.length>0){
     coverImageLocalPath=req.files.coverImage[0].path;
   }
  */

   const user=await User.create({
    fullname,
    //coverImage,
    email,
    password,
    username:username.toLowerCase()
   })
    const created_user=await User.findById(user._id).select(
     "-password -refreshToken"
    );

    if (!created_user) {
     throw new ApiError(500,"Something went wrong while registering user"); 
    }

    return res.status(201).json(new ApiResponse(200,created_user,"User Registered sucessfully"))
}) 

const loginUsers=asyncHandler(async (req,res)=>{
  //req-body data
  const {email,username,password}=req.body;
  if (!(username || email)) {
   throw new ApiError(400,"Username or Password is required"); 
  }
  const user=await User.findOne({$or:[{username},{email}]});

  if (!user) {
   throw new ApiError(404,"User does not exist"); 
  }

 const valid_password= await user.isPasswordCorrect(password);
 if (!valid_password) {
   throw new ApiError(401,"Password incorrect"); 
 }

 const {access_token,refresh_token}=await generateAccessandRefreshToken(user._id);

 const loggedIn=await User.findById(user._id).select("-password -refreshToken");
 
 const options={
  httpOnly:true,
  secure:true,
 }

 return res
 .status(200)
 .cookie("accessToken",access_token,options)
 .cookie("refreshToken",refresh_token,options)
 .json(new ApiResponse(200,{
  user:loggedIn,access_token,refresh_token
 },"User loggedIn successfully"));

})

const logoutUser = asyncHandler(async (req, res) => {
  await User.findByIdAndUpdate(req.user._id, {
    $set: {
      refreshToken: undefined
    },
  },
    {
      new: true
    }
  )
 const options={
  httpOnly:true,
  secure:true,
 }

 return res.status(200).clearCookie("accessToken",options).clearCookie("refreshToken",options).json(new ApiResponse(200,{},"User logout succesfully"))

})

const refreshAccessToken=asyncHandler(async (req,res)=>{
  const incomming_refresh_token=req.cookies.refreshToken || req.body.refreshToken
  if (!incomming_refresh_token) {
   throw new ApiError(401,"Unauthorized request"); 
  }
  
  try {
    const decoded_token=jwt.verify(incomming_refresh_token,process.env.REFRESH_TOKEN_SECRET);
    const user=await User.findById(decoded_token?._id);
    if (!user) {
     throw new ApiError(401,"Invalid Refresh Token"); 
    }
    console.log(user.refreshToken);
    if (incomming_refresh_token!==user?.refreshToken) {
     throw new ApiError(401,"Refresh Token if Expired or Used"); 
    }
    const options={
    httpOnly:true,
    secure:true,
   }
   const {access_token,refresh_token}=await generateAccessandRefreshToken(user._id);
   return res.status(200).cookie("accessToken",access_token,options).cookie("refreshToken",refresh_token,options).json(new ApiResponse(200,{access_token,refresh_token},"Access Token Refreshed"));
  } catch (error) {
   throw new ApiError(501,error?.message||"Invalid Refresh Token"); 
  }
})

const changeCurrentUserPassword=asyncHandler(async(req,res)=>{
  const {oldPassword,newPassword}=req.body
  const user=await User.findById(req.user?.id);
  const checkPassword=await user.isPasswordCorrect(oldPassword);
  if (!checkPassword) {
   throw new ApiError(400,"Invalid old password") 
  }
  user.password=newPassword;
  await user.save({validateBeforeSave:false})

  return res
  .status(200)
  .json(new ApiResponse(200,{},"password changed sucessfully"))
})

const getCurrentUser=asyncHandler(async (req,res)=>{
  return res.status(200).json(new ApiResponse(200,req.user,"Current user fetched sucessfully"))
})

const updateAccountDetails=asyncHandler(async (req,res)=>{
  const {fullname,email}=req.body;
  if (!fullname || !email) {
    throw new ApiError(400,"All fields are required")
  }

  const user=User.findByIdAndUpdate(req.user?._id,{
    $set:{
      fullname,
      email
    }
  },{new:true}).select("-password");

  return res.status(200).json(new ApiResponse(200,user,"fullname and email updated"))
})

export { registerUser, loginUsers, logoutUser ,refreshAccessToken,changeCurrentUserPassword,getCurrentUser,updateAccountDetails};
