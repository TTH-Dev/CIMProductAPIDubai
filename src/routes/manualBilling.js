import express from "express";
import {
    createBilling,
    getAllBillings,
   getManualBillById
} from "../controllers/manualBilling.js";

import { protect } from "../controllers/admin.js"; 

const manualbillingRouter = express.Router();

manualbillingRouter.use(protect);

manualbillingRouter.route("/")
    .get(getAllBillings)
    .post(createBilling);

 manualbillingRouter.route("/getById/:id").get(getManualBillById)   



export default manualbillingRouter;
