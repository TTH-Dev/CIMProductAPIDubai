import express from "express";
import {
    createTpaCompany,
    getAllTpa,
    getTpa,
    updateTPA,
    deleteTPA,
    filterTPA
} from "../controllers/tpaManagement.js";

import { protect } from "../controllers/admin.js";
import { uploadCompanyImages } from "../utils/multerConfig.js";

const tpaRouter = express.Router();

tpaRouter.use(protect);

tpaRouter.route("/")
    .post(uploadCompanyImages, createTpaCompany)
    .get(getAllTpa);

tpaRouter.route("/filter")
    .get(filterTPA);

tpaRouter.route("/:id")
    .get(getTpa)
    .patch(uploadCompanyImages, updateTPA)
    .delete(deleteTPA);

export default tpaRouter;
