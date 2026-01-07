import express from "express";
import {
  createWardManagement,
  getAllWardManagements,
  getWardManagementById,
  updateWardManagement,
  deleteWardManagement,
} from "../controllers/wardManagement.js";

const wardManagementRouter = express.Router();

wardManagementRouter
  .route("/")
  .post(createWardManagement)
  .get(getAllWardManagements);

wardManagementRouter
  .route("/:id")
  .get(getWardManagementById)
  .patch(updateWardManagement)
  .delete(deleteWardManagement);

export default wardManagementRouter;
