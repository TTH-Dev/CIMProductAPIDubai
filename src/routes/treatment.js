import express from "express";
import {
  getAllTreatment,
  createTreatment,
  editTreatmentById,
  deleteTreatmentById,
  getTreatmentById,
  treatmentDmMenu
} from "../controllers/treatment.js";

const treatmentRouter = express.Router();

treatmentRouter
  .route("/")
  .post(createTreatment)
  .get(getAllTreatment)
  .patch(editTreatmentById);

treatmentRouter
  .route("/getById")
  .delete(deleteTreatmentById)
  .get(getTreatmentById);

treatmentRouter.route("/dm-menu").get(treatmentDmMenu)  

export default treatmentRouter;
