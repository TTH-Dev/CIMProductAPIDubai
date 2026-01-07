import express from 'express';
import {
    createAnestheticsAssessment,
    getAllAnestheticsAssessments,
    getAnestheticsAssessment,
    updateAnestheticsAssessment,
    deleteAnestheticsAssessment
} from "../../controllers/ot/anestheticsAssessment.js";
import { protect } from '../../controllers/admin.js';
import { uploadCompanyImages } from "../../utils/multerConfig.js";

const anestheticsAssessmentRouter = express.Router();

anestheticsAssessmentRouter.use(protect);

anestheticsAssessmentRouter.route("/")
    .post(uploadCompanyImages, createAnestheticsAssessment)
    .get(getAllAnestheticsAssessments);

anestheticsAssessmentRouter.route("/:id")
    .get(getAnestheticsAssessment)
    .patch(uploadCompanyImages, updateAnestheticsAssessment)
    .delete(deleteAnestheticsAssessment);

export default anestheticsAssessmentRouter;
