import express from 'express';
import {
    createPurchase,
    getAllPurchases,
    getPurchase,
    updatePurchase,
    deletePurchase,
    filterPurchases,
    bulkUpdatePurchase
} from "../controllers/purchase.js";
import { protect } from '../controllers/admin.js';

const purchaseRouter = express.Router();

purchaseRouter.use(protect);

purchaseRouter.route("/")
    .get(getAllPurchases)
    .post(createPurchase);

purchaseRouter.get("/filter", filterPurchases);

purchaseRouter.post("/bulk-edit", bulkUpdatePurchase);

purchaseRouter.route("/:id")
    .get(getPurchase)
    .patch(updatePurchase)
    .delete(deletePurchase);


export default purchaseRouter;
