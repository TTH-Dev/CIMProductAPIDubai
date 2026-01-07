import express from 'express';


import { subAdminLogin, subadminOtpVerify,
    resendOTP,
    createSubadmin,
    getsubAdmin,
    updateSubadmin,
    deleteSubadmin,
    getAllsubAdmin,
    getSubadmin,getPharam } from '../controllers/superSubAdmin.js';

import { protect } from '../controllers/admin.js';

const supersubadminRouter = express.Router();

supersubadminRouter.route("/resendotp").post(resendOTP);
supersubadminRouter.route("/getPharam").get(getPharam)

supersubadminRouter.route("/login").post(subAdminLogin);

supersubadminRouter.route("/otp-verify").post(subadminOtpVerify);

supersubadminRouter.use(protect)

supersubadminRouter.route("/getById/:id")
    .get(getsubAdmin)
    .patch(updateSubadmin)
    .delete(deleteSubadmin);

supersubadminRouter.route("/")
    .get(getAllsubAdmin)
    .post(createSubadmin);

supersubadminRouter.route("/getMe").get(getSubadmin)


export default supersubadminRouter;