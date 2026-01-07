import express from 'express';

import {
    adminLogin,
    adminSignup,
    forgotPassword,
    otpValidation,
    updatePassword,
    resetPassword,
    updateAdmin,
    protect,
    getAdmin    
 }  from "../controllers/superAdmin.js";

 import { uploadCompanyImages } from '../utils/multerConfig.js';

 const superadminRouter = express.Router();
 
 superadminRouter.route("/signup").post(adminSignup);

 superadminRouter.route("/login").post(adminLogin);
 
 superadminRouter.route("/forgotPassword").post(forgotPassword);

superadminRouter.route("/otpValidation").post(otpValidation);

superadminRouter.route("/updatePassword").patch(updatePassword);

superadminRouter.route("/resetPassword").patch(resetPassword);

superadminRouter.use(protect);

superadminRouter.route("/update-admin").patch(uploadCompanyImages,updateAdmin);

superadminRouter.route("/getMe").get(getAdmin);


 export default superadminRouter;

