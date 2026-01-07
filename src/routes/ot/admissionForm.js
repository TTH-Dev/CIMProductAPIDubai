import express from 'express';
import {
    createAdmissionForm,
    getAllAdmissionForms,
    getAdmissionForm,
    updateAdmissionForm,
    deleteAdmissionForm
} from "../../controllers/ot/admissionForm.js";
import { protect } from '../../controllers/admin.js';
import { uploadCompanyImages } from "../../utils/multerConfig.js";

const admissionFormRouter = express.Router();

admissionFormRouter.use(protect);

admissionFormRouter.route("/")
    .post(uploadCompanyImages, createAdmissionForm)
    .get(getAllAdmissionForms);

admissionFormRouter.route("/:id")
    .get(getAdmissionForm)
    .patch(uploadCompanyImages, updateAdmissionForm)
    .delete(deleteAdmissionForm);

export default admissionFormRouter;
