import express from "express";
import {
    createRefractionSheet,
    getAllRefractionSheets,
    getRefractionSheetById,
    updateRefractionSheet,
    deleteRefractionSheet,
} from "../controllers/refractionSheet.js";

import { protect } from "../controllers/admin.js";
import { uploadCompanyImages } from "../utils/multerConfig.js";

const refractionSheetRouter = express.Router();

refractionSheetRouter.use(protect);

refractionSheetRouter.route("/getById/:id")
    .get(getRefractionSheetById)
    .patch(uploadCompanyImages,updateRefractionSheet)
    .delete(deleteRefractionSheet);

refractionSheetRouter.route("/")
    .get(getAllRefractionSheets)
    .post(uploadCompanyImages,createRefractionSheet);

export default refractionSheetRouter;
