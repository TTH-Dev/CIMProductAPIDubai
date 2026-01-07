import express from 'express';
import {
    createPreOperativeChecklist,
    getAllPreOperativeChecklists,
    getPreOperativeChecklist,
    updatePreOperativeChecklist,
    deletePreOperativeChecklist
} from "../../controllers/ot/preoperativeChecklist.js";
import { protect } from '../../controllers/admin.js';
import { uploadCompanyImages } from "../../utils/multerConfig.js";

const preOperativeChecklistRouter = express.Router();

preOperativeChecklistRouter.use(protect);

preOperativeChecklistRouter.route("/")
    .post(uploadCompanyImages, createPreOperativeChecklist)
    .get(getAllPreOperativeChecklists);

preOperativeChecklistRouter.route("/:id")
    .get(getPreOperativeChecklist)
    .patch(uploadCompanyImages, updatePreOperativeChecklist)
    .delete(deletePreOperativeChecklist);

export default preOperativeChecklistRouter;
