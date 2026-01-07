import express from "express";
import {
  createTrail,
  getAllTrail,
  updateTrailById,
  getTrailById,
} from "../controllers/trail.js";
import {createCall} from "../controllers/retellai.js"
const trailRouter = express.Router();

trailRouter
  .route("/")
  .post(createTrail)
  .get(getAllTrail)
  .patch(updateTrailById);

  trailRouter.route("/chat").post(createCall)

trailRouter.route("/getById").get(getTrailById);

export default trailRouter;
