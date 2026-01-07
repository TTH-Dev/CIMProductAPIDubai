import express from 'express';
import {
    createProvisionalDiagnosis,
    getAllProvisionalDiagnosiss,
    getProvisionalDiagnosis,
    updateProvisionalDiagnosis,
    deleteProvisionalDiagnosis
} from "../controllers/provisionalDiagnosis.js";
import { protect } from '../controllers/admin.js';
import { uploadCompanyImages } from "../utils/multerConfig.js";

const provisionalDiagnosisRouter = express.Router();

provisionalDiagnosisRouter.use(protect);

provisionalDiagnosisRouter.route("/")
    .post(uploadCompanyImages, createProvisionalDiagnosis)
    .get(getAllProvisionalDiagnosiss);

provisionalDiagnosisRouter.route("/:id")
    .get(getProvisionalDiagnosis)
    .patch(uploadCompanyImages, updateProvisionalDiagnosis)
    .delete(deleteProvisionalDiagnosis);

export default provisionalDiagnosisRouter;


