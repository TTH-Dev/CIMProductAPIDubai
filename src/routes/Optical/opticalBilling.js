import express from 'express';
import {
    createOpticalBilling,
    getAllOpticalBilling,
    getOpticalBillingById,
    updateOpticalBilling,
    deleteOpticalBilling,
    getOpticalSalesReport
} from "../../controllers/Optical/opticalBilling.js";

import { protect } from "../../controllers/admin.js";



const opticalBillingRouter = express.Router();

opticalBillingRouter.use(protect);

opticalBillingRouter.route("/salesReport").get(getOpticalSalesReport);

opticalBillingRouter.route("/").get(getAllOpticalBilling).post(createOpticalBilling);

opticalBillingRouter.route("/:id").get(getOpticalBillingById).patch(updateOpticalBilling).delete(deleteOpticalBilling);


export default opticalBillingRouter;