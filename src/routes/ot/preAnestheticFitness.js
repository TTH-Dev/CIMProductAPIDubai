import express from 'express';
import {
    createPreAnestheticFitness,
    getAllPreAnestheticFitness,
    getPreAnestheticFitness,
    updatePreAnestheticFitness,
    deletePreAnestheticFitness
} from "../../controllers/ot/preAnestheticFitness.js";
import { protect } from '../../controllers/admin.js';
import { uploadCompanyImages } from "../../utils/multerConfig.js";

const preAnestheticFitnessRouter = express.Router();

preAnestheticFitnessRouter.use(protect);

preAnestheticFitnessRouter.route("/")
    .post(uploadCompanyImages, createPreAnestheticFitness)
    .get(getAllPreAnestheticFitness);

preAnestheticFitnessRouter.route("/:id")
    .get(getPreAnestheticFitness)
    .patch(uploadCompanyImages, updatePreAnestheticFitness)
    .delete(deletePreAnestheticFitness);

export default preAnestheticFitnessRouter;
