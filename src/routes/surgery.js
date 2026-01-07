import express from 'express';
import {
  createSurgery,
  getAllSurgeries,
  getSurgeryById,
  updateSurgery,
  deleteSurgery
} from "../controllers/surgery.js";
import { protect } from '../controllers/admin.js';

const surgeryRouter = express.Router();

// Protect all surgery routes
surgeryRouter.use(protect);

surgeryRouter.route("/")
  .post(createSurgery)
  .get(getAllSurgeries);

surgeryRouter.route("/:id")
  .get(getSurgeryById)
  .patch(updateSurgery)
  .delete(deleteSurgery);

export default surgeryRouter;
