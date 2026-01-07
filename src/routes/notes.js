import express from 'express';
import {
    createNotes,
    getAllNotess,
    getNotes,
    updateNotes,
    deleteNotes
} from "../controllers/notes.js";
import { protect } from '../controllers/admin.js';
import { uploadCompanyImages } from "../utils/multerConfig.js";

const notesRouter = express.Router();

notesRouter.use(protect);

notesRouter.route("/")
    .post(uploadCompanyImages, createNotes)
    .get(getAllNotess);

notesRouter.route("/:id")
    .get(getNotes)
    .patch(uploadCompanyImages, updateNotes)
    .delete(deleteNotes);

export default notesRouter;


