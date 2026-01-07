import express from 'express';
import {
    createBiometry,
    getAllBiometrys,
    getBiometry,
    updateBiometry,
    deleteBiometry
} from "../controllers/biometry.js";
import { protect } from '../controllers/admin.js';
import { uploadCompanyImages } from "../utils/multerConfig.js";


const biometryRouter = express.Router();


biometryRouter.use(protect);

biometryRouter.route("/")
    .post(uploadCompanyImages, createBiometry)
    .get(getAllBiometrys);

biometryRouter.route("/:id")
    .get(getBiometry)
    .patch(uploadCompanyImages, updateBiometry)
    .delete(deleteBiometry);

export default biometryRouter;

