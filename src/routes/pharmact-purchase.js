import express from 'express';
import {
    createPharmacyPurchase,
    getAllPharmacyPurchases,
    getPharmacyPurchase,
    updatePharmacyPurchase,
    deletePharmacyPurchase,
    filterPharmacyPurchases,
    bulkUpdatePharmacyPurchase,
    purchaseReturn
} from "../controllers/pharmact-purchase.js";
import { protect } from '../controllers/admin.js';

const pharmacyPurchaseRouter = express.Router();

pharmacyPurchaseRouter.use(protect);

pharmacyPurchaseRouter.route("/")
    .get(getAllPharmacyPurchases)
    .post(createPharmacyPurchase);
 pharmacyPurchaseRouter.route("/purchaseReturn").post(purchaseReturn)

pharmacyPurchaseRouter.get("/filter", filterPharmacyPurchases);

pharmacyPurchaseRouter.post("/bulk-edit", bulkUpdatePharmacyPurchase);

pharmacyPurchaseRouter.route("/:id")
    .get(getPharmacyPurchase)
    .patch(updatePharmacyPurchase)
    .delete(deletePharmacyPurchase);


export default pharmacyPurchaseRouter;
