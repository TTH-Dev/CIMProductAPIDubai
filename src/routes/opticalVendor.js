import express from 'express';
import {
    createOpticalVendor,
    getAllOpticalVendor,
    getOpticalVendorById,
    updateOpticalVendor,
    deleteOpticalVendor,
    opticalVendorDMmenu
} from "../controllers/opticalVendor.js";

 const opticalVendorRouter = express.Router();

 opticalVendorRouter.route("/").get(getAllOpticalVendor).post(createOpticalVendor);

 opticalVendorRouter.route("/getById/:id").get(getOpticalVendorById).patch(updateOpticalVendor).delete(deleteOpticalVendor);

 opticalVendorRouter.route("/dm-menu").get(opticalVendorDMmenu);

 export default opticalVendorRouter;