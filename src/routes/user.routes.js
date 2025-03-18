import {Router} from "express"
import { registerUser } from "../controller/User.controller.js";

const userRouter=Router();
userRouter.route("/register",registerUser);

export default userRouter;