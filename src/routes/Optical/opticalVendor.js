import express from 'express';
import {
    createOpticalVendor,
    getAllOpticalVendor,
    getOpticalVendorById,
    updateOpticalVendor,
    deleteOpticalVendor,
    opticalVendorDMmenu,
    importOpticalVendorsFromExcel
} from "../../controllers/Optical/opticalVendor.js";

import { uploadExcel } from '../../utils/multerConfig.js';

 const opticalVendorRouter = express.Router();

 opticalVendorRouter.route("/").get(getAllOpticalVendor).post(createOpticalVendor);

 opticalVendorRouter.route("/getById/:id").get(getOpticalVendorById).patch(updateOpticalVendor).delete(deleteOpticalVendor);

 opticalVendorRouter.route("/dm-menu").get(opticalVendorDMmenu);

 opticalVendorRouter.route("/import-data").post(uploadExcel.single("file"), importOpticalVendorsFromExcel);
 
 export default opticalVendorRouter;