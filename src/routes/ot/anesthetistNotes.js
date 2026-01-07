import express from 'express';
import {
    createAnestheticsNotes,
    getAllAnestheticsNotes,
    getAnestheticsNotes,
    updateAnestheticsNotes,
    deleteAnestheticsNotes
} from "../../controllers/ot/anesthetistNotes.js";
import { protect } from '../../controllers/admin.js';
import { uploadCompanyImages } from "../../utils/multerConfig.js";

const anestheticsNotesRouter = express.Router();

anestheticsNotesRouter.use(protect);

anestheticsNotesRouter.route("/")
    .post(uploadCompanyImages, createAnestheticsNotes)
    .get(getAllAnestheticsNotes);

anestheticsNotesRouter.route("/:id")
    .get(getAnestheticsNotes)
    .patch(uploadCompanyImages, updateAnestheticsNotes)
    .delete(deleteAnestheticsNotes);

export default anestheticsNotesRouter;
