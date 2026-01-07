import express from "express";
import {
    getVitalsById,
    updateVitals,
    deleteVitals,
    getAllVitals,
    createVitals,
} from "../controllers/Vitals.js";

import { protect } from "../controllers/admin.js";

const vitalsRouter = express.Router();

vitalsRouter.use(protect);

vitalsRouter.route("/getById/:id")
    .get(getVitalsById)
    .patch(updateVitals)
    .delete(deleteVitals);

vitalsRouter.route("/")
    .get(getAllVitals)
    .post(createVitals);

export default vitalsRouter;
