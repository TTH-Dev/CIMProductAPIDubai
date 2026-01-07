import express from "express";
import {
    createMedicalHistory,
    getAllChiefComplaints,
    getChiefComplaintById,
    updateChiefComplaint,
    deleteChiefComplaint,
} from "../controllers/medicalHistory.js";

import { protect } from "../controllers/admin.js";

const medicalHistoryRouter = express.Router();

medicalHistoryRouter.use(protect);

medicalHistoryRouter.route("/getById/:id")
    .get(getChiefComplaintById)
    .patch(updateChiefComplaint)
    .delete(deleteChiefComplaint);

medicalHistoryRouter.route("/")
    .get(getAllChiefComplaints)
    .post(createMedicalHistory);

export default medicalHistoryRouter;
