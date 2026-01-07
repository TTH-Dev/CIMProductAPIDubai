import express from 'express';
import {
    createOpticalProduct,
    getAllOpticalProduct,
    getOpticalProductById,
    updateOpticalProduct,
    deleteOpticalProduct,
    opticalproductDMmenu,
    opticalproductByVendor,
    importOpticalProductsFromExcel
} from "../../controllers/Optical/OpticalProducts.js";

import { uploadExcel } from '../../utils/multerConfig.js';
import { protect } from '../../controllers/admin.js';
const opticalProductRouter = express.Router();

  opticalProductRouter.use(protect);
  
opticalProductRouter.route("/").get(getAllOpticalProduct).post(createOpticalProduct);

opticalProductRouter.route("/getById/:id").get(getOpticalProductById).patch(updateOpticalProduct).delete(deleteOpticalProduct);

opticalProductRouter.route("/dm-menu").get(opticalproductDMmenu);

opticalProductRouter.route("/getByVendor").get(opticalproductByVendor);

opticalProductRouter.route("/import-data").post(uploadExcel.single("file"), importOpticalProductsFromExcel);


export default opticalProductRouter;