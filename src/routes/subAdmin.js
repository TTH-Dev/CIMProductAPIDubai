import express from 'express';


import {
    subAdminLogin,
    subadminOtpVerify,
    resendOTP,
    createSubadmin,
    getsubAdmin,
    updateSubadmin,
    deleteSubadmin,
    getAllsubAdmin,
    getSubadmin,getPharam,getEmpIds,getData
} from "../controllers/subAdmin.js";

 import { uploadCompanyImages } from '../utils/multerConfig.js';


import { protect } from '../controllers/admin.js';

const subadminRouter = express.Router();

subadminRouter.route("/resendotp").post(resendOTP);
subadminRouter.route("/getPharam").get(getPharam)

subadminRouter.route("/login").post(subAdminLogin);

subadminRouter.route("/otp-verify").post(subadminOtpVerify);

subadminRouter.use(protect)

subadminRouter.route("/getById/:id")
    .get(getsubAdmin)
    .patch(uploadCompanyImages,updateSubadmin)
    .delete(deleteSubadmin);

subadminRouter.route("/")
    .get(getAllsubAdmin)
    .post(uploadCompanyImages,createSubadmin);

subadminRouter.route("/getMe").get(getSubadmin)

subadminRouter.route("/getEmpIds").get(getEmpIds)

subadminRouter.route("/getData").get(getData)


export default subadminRouter;