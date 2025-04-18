import {Router} from "express"
import { loginUsers, logoutUser, refreshAccessToken, registerUser } from "../controller/User.controller.js";
//import { upload } from "../middlewares/multer.middleware.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const userRouter=Router();
userRouter.route("/register").post(/**upload.fields([
    {
        name:"avatar",
        maxCount:1
    },
    {
        name:"coverImage",
        maxCount:1
    }
]),*/registerUser);
userRouter.route("/login").post(loginUsers);

//secured Routes
userRouter.route("/logout").post(verifyJWT,logoutUser);
userRouter.route("/refreshtoken").post(refreshAccessToken);

export default userRouter;
