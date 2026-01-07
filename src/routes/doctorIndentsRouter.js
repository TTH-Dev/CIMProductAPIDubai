import express from "express";

import {getAllProducts,createProduct} from "../controllers/doctorIndents.js"
import { protect } from "../controllers/admin.js"; 

const doctorIndentsRouter = express.Router();

doctorIndentsRouter.use(protect);

doctorIndentsRouter.route("/")
    .get(getAllProducts)
    .post(createProduct);




export default doctorIndentsRouter;
