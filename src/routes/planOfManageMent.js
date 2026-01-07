import express from 'express';

import {
    createPOM,
    getAllPOMs,
    getPOM,
    updatePOM,
    deletePOM
} from "../controllers/planOfManageMent.js";
import { protect } from '../controllers/admin.js';
import { uploadCompanyImages } from "../utils/multerConfig.js";

const planOfManageMentRouter = express.Router();

planOfManageMentRouter.use(protect);

planOfManageMentRouter.route("/")
    .post(uploadCompanyImages, createPOM)
    .get(getAllPOMs);

planOfManageMentRouter.route("/:id")
    .get(getPOM)
    .patch(uploadCompanyImages, updatePOM)
    .delete(deletePOM);

export default planOfManageMentRouter;


