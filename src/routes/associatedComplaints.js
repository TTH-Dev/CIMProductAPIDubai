import express from "express";
import {
    createAssociatedComplaint,
    getAllAssociatedComplaints,
    getAssociatedComplaintById,
    updateAssociatedComplaint,
    deleteAssociatedComplaint,
} from "../controllers/associatedComplaints.js";

import { protect } from "../controllers/admin.js";

const associatedComplaintsRouter = express.Router();

associatedComplaintsRouter.use(protect);

associatedComplaintsRouter.route("/getById/:id")
    .get(getAssociatedComplaintById)
    .patch(updateAssociatedComplaint)
    .delete(deleteAssociatedComplaint);

associatedComplaintsRouter.route("/")
    .get(getAllAssociatedComplaints)
    .post(createAssociatedComplaint);

export default associatedComplaintsRouter;
