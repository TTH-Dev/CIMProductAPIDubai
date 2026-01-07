import express from 'express';
import {
    createSurgeryNotes,
    getAllSurgeryNotes,
    getSurgeryNotes,
    updateSurgeryNotes,
    deleteSurgeryNotes
} from "../../controllers/ot/surgeryNotes.js";
import { protect } from '../../controllers/admin.js';
import { uploadCompanyImages } from "../../utils/multerConfig.js";

const surgeryNotesRouter = express.Router();

surgeryNotesRouter.use(protect);

surgeryNotesRouter.route("/")
    .post(uploadCompanyImages, createSurgeryNotes)
    .get(getAllSurgeryNotes);

surgeryNotesRouter.route("/:id")
    .get(getSurgeryNotes)
    .patch(uploadCompanyImages, updateSurgeryNotes)
    .delete(deleteSurgeryNotes);

export default surgeryNotesRouter;
