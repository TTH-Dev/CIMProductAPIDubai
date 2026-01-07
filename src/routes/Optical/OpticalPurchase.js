import express from 'express';
import {
    createOpticalPurchase,
    getAllOpticalPurchases,
    getOpticalPurchase,
    updateOpticalPurchase,
    deleteOpticalPurchase,
    filterOpticalPurchases,
    bulkUpdateOpticalPurchase
} from "../../controllers/Optical/OpticalPurchase.js";
import { protect } from "../../controllers/admin.js";

const opticalPurchaseRouter = express.Router();

opticalPurchaseRouter.use(protect);

opticalPurchaseRouter.route("/")
    .get(getAllOpticalPurchases)
    .post(createOpticalPurchase);

opticalPurchaseRouter.get("/filter", filterOpticalPurchases);

opticalPurchaseRouter.post("/bulk-edit", bulkUpdateOpticalPurchase);

opticalPurchaseRouter.route("/:id")
    .get(getOpticalPurchase)
    .patch(updateOpticalPurchase)
    .delete(deleteOpticalPurchase);


export default opticalPurchaseRouter;
