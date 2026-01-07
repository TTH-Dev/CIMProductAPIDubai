import express from "express";
import {
    createProduct,
    getAllProducts,
    getProduct,
    updateProduct,
    deleteProduct,
    filterProducts,
    dmMenuProduct,
    FindingByVendor
} from "../controllers/products.js";
import { protect } from "../controllers/admin.js";
const productsRouter = express.Router();

productsRouter.use(protect);

productsRouter.route("/")
    .post(createProduct)    
    .get(getAllProducts);   

productsRouter.route("/filter")
    .get(filterProducts);   

    productsRouter.route("/dm-menu")
    .get(dmMenuProduct);   

    
    productsRouter.route("/findyBy-vendor")
    .post(FindingByVendor); 

productsRouter.route("/:id")
    .get(getProduct)        
    .patch(updateProduct)     
    .delete(deleteProduct); 

export default productsRouter;
