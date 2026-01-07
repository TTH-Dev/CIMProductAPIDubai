import express from "express";
import { protect } from "../controllers/admin.js";
import {
  createPharmacyRequest,
  getAllPharmacyRequest,
  getPharmacyRequestByID,
  getPharmaProdReqDM,updatePharmaProdReq,updatePharmaProdReqStatus
} from "../controllers/pharmacyProductRequest.js";

const pharmacyProductRequestRouter = express.Router();

pharmacyProductRequestRouter.use(protect);

pharmacyProductRequestRouter
  .route("/")
  .post(createPharmacyRequest)
  .get(getAllPharmacyRequest);

pharmacyProductRequestRouter.route("/byId").get(getPharmacyRequestByID);

pharmacyProductRequestRouter.route("/dm").get(getPharmaProdReqDM);

pharmacyProductRequestRouter.route("/updatePharmaProdReq").patch(updatePharmaProdReq)

pharmacyProductRequestRouter.route("/updatePharmaProdReqStatus").patch(updatePharmaProdReqStatus)

export default pharmacyProductRequestRouter;
