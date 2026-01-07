import express from 'express';
import {
    createDischargeSummery,
    getAllDischargeSummeries,
    getDischargeSummery,
    updateDischargeSummery,
    deleteDischargeSummery
} from "../../controllers/ot/dischargeSummery.js";
import { protect } from '../../controllers/admin.js';
import { uploadCompanyImages } from "../../utils/multerConfig.js";

const dischargeSummeryRouter = express.Router();

dischargeSummeryRouter.use(protect);

dischargeSummeryRouter.route("/")
    .post(uploadCompanyImages, createDischargeSummery)
    .get(getAllDischargeSummeries);

dischargeSummeryRouter.route("/:id")
    .get(getDischargeSummery)
    .patch(uploadCompanyImages, updateDischargeSummery)
    .delete(deleteDischargeSummery);

export default dischargeSummeryRouter;
