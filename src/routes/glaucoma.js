import express from "express";
import {
    createGlaucoma,
    getAllGlaucomas,
    getGlaucomaById,
    updateGlaucoma,
    deleteGlaucoma,
} from "../controllers/glaucoma.js";

import { protect } from "../controllers/admin.js";
import { uploadCompanyImages } from "../utils/multerConfig.js";

const glaucomaRouter = express.Router();

glaucomaRouter.use(protect);

glaucomaRouter.route("/getById/:id")
    .get(getGlaucomaById)
    .patch(uploadCompanyImages,updateGlaucoma)
    .delete(deleteGlaucoma);

glaucomaRouter.route("/")
    .get(getAllGlaucomas)
    .post(uploadCompanyImages,createGlaucoma);

export default glaucomaRouter;
