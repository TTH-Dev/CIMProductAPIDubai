import express from "express";
import {
  createProduct,
  getAllProducts,
  getSalesReport,
  getPaymentDetails
} from "../controllers/velacherryIndents.js";

import { protect } from "../controllers/admin.js";

const velacheryIndentsRouter = express.Router();

velacheryIndentsRouter.use(protect);

velacheryIndentsRouter.route("/").post(createProduct).get(getAllProducts);

velacheryIndentsRouter.route("/getSalesreport").get(getSalesReport)

velacheryIndentsRouter.route("/getPaymentDetails").get(getPaymentDetails)

export default velacheryIndentsRouter;
