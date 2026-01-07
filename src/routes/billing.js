import express from "express";
import {
    createBilling,
    getAllBillings,
    getBillingById,
    updateBilling,
    deleteBilling,
    filterBilling,
    getByIdPatient,
    createCompleteBilling,billtoMail,precstoMail,pharmaBilltoMail
} from "../controllers/billing.js";
 import { uploadCompanyImages } from '../utils/multerConfig.js';


import { protect } from "../controllers/admin.js"; 

const billingRouter = express.Router();

billingRouter.use(protect);

billingRouter.route("/filter").get(filterBilling);

billingRouter.route("/getByIdPatient").get(getByIdPatient);

billingRouter.route("/createCompleteBilling").post(createCompleteBilling)

billingRouter.route("/getById/:id")
    .get(getBillingById)
    .patch(updateBilling)
    .delete(deleteBilling);


billingRouter.route("/")
    .get(getAllBillings)
    .post(createBilling);

billingRouter.route("/bill-mail").post(uploadCompanyImages,billtoMail)    
billingRouter.route("/precstoMail").post(uploadCompanyImages,precstoMail) 
billingRouter.route("/pharmaBilltoMail").post(uploadCompanyImages,pharmaBilltoMail)  



export default billingRouter;
