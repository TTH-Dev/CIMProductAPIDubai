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
    getMe ,
    createUsageAnalytical,
       getAllUsageAnalytical,
       homeData,getAllAdmin,getAdminById
 }  from "../controllers/admin.js";

 import { uploadCompanyImages } from '../utils/multerConfig.js';

 const adminRouter = express.Router();
 
 adminRouter.route("/signup").post(adminSignup);

 adminRouter.route("/login").post(adminLogin);
 
 adminRouter.route("/forgotPassword").post(forgotPassword);

adminRouter.route("/otpValidation").post(otpValidation);

adminRouter.route("/updatePassword").patch(updatePassword);

adminRouter.route("/resetPassword").patch(resetPassword);

adminRouter.use(protect);
adminRouter.route("/").get(getAllAdmin);
adminRouter.route("/update-admin").patch(uploadCompanyImages,updateAdmin);

adminRouter.route("/getMe").get(getMe);
adminRouter.route("/getById").get(getAdminById);

adminRouter.route("/getUsage").get(getAllUsageAnalytical);

adminRouter.route("/getUsage").post(createUsageAnalytical);

adminRouter.route("/homeData").get(homeData);


 export default adminRouter;

