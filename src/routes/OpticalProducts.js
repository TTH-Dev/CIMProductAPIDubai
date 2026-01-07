import express from 'express';
import {
    createOpticalProduct,
    getAllOpticalProduct,
    getOpticalProductById,
    updateOpticalProduct,
    deleteOpticalProduct,
    opticalproductDMmenu
} from "../controllers/OpticalProducts.js";

 const opticalProductRouter = express.Router();

 opticalProductRouter.route("/").get(getAllOpticalProduct).post(createOpticalProduct);

 opticalProductRouter.route("/getById/:id").get(getOpticalProductById).patch(updateOpticalProduct).delete(deleteOpticalProduct);

 opticalProductRouter.route("/dm-menu").get(opticalproductDMmenu);

 export default opticalProductRouter;