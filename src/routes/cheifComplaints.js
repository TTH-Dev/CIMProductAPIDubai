import express from "express";
import {
    createChiefComplaints,
    getAllChiefComplaints,
    getChiefComplaintById,
    updateChiefComplaint,
    deleteChiefComplaint,
} from "../controllers/cheifComplaints.js";

import { protect } from "../controllers/admin.js";

const chiefComplaintsRouter = express.Router();

chiefComplaintsRouter.use(protect);

chiefComplaintsRouter.route("/getById/:id")
    .get(getChiefComplaintById)
    .patch(updateChiefComplaint)
    .delete(deleteChiefComplaint);

chiefComplaintsRouter.route("/")
    .get(getAllChiefComplaints)
    .post(createChiefComplaints);

export default chiefComplaintsRouter;
