import express from "express";
import {
    createBilling,
    getAllBillings,
   getManualBillById
} from "../controllers/campIndents.js";

import { protect } from "../controllers/admin.js"; 

const campbillingRouter = express.Router();

campbillingRouter.use(protect);

campbillingRouter.route("/")
    .get(getAllBillings)
    .post(createBilling);

 campbillingRouter.route("/getById/:id").get(getManualBillById)   



export default campbillingRouter;
