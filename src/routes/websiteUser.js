import express from "express";
import { websiteUserLogin, websiteUserRegister } from "../controllers/websiteUser.js";

const websiteUserRouter = express.Router();

websiteUserRouter.post("/login", websiteUserLogin);
websiteUserRouter.post("/register", websiteUserRegister);

export default websiteUserRouter;
