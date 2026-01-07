import express from "express";
import {
  createTreatmentPlan,
  getAllTreatmentPlan,
  editTreatmentPlanById,
  getTreatmentPlanById,
} from "../controllers/treatmentPLan.js";

const treatmentPlanRouter = express.Router();

treatmentPlanRouter
  .route("/")
  .post(createTreatmentPlan)
  .get(getAllTreatmentPlan)
  .patch(editTreatmentPlanById);

treatmentPlanRouter
  .route("/getById")
  .get(getTreatmentPlanById);


export default treatmentPlanRouter;
