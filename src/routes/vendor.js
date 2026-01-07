import express from "express";
import {
    createVendor,
    getAllVendors,
    getVendor,
    updateVendor,
    deleteVendor,
    filterVendors,
    dmMenuVendor
} from "../controllers/vendor.js";
import { protect } from "../controllers/admin.js";
const vendorRouter = express.Router();

vendorRouter.use(protect);

vendorRouter.route("/")
    .post(createVendor)
    .get(getAllVendors);

vendorRouter.route("/filter")
    .get(filterVendors);

    vendorRouter.route("/dm-menu")
    .get(dmMenuVendor);
vendorRouter.route("/:id")
    .get(getVendor)
    .patch(updateVendor)
    .delete(deleteVendor);

export default vendorRouter;
