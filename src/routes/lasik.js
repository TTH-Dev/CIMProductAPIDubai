import express from 'express';
import {
    createLasik,
    getAllLasiks,
    getLasik,
    updateLasik,
    deleteLasik
} from "../controllers/lasik.js";
import { protect } from '../controllers/admin.js';
import { uploadCompanyImages } from "../utils/multerConfig.js";


const lasikRouter = express.Router();


lasikRouter.use(protect);

lasikRouter.route("/")
    .post(uploadCompanyImages, createLasik)
    .get(getAllLasiks);

lasikRouter.route("/:id")
    .get(getLasik)
    .patch(uploadCompanyImages, updateLasik)
    .delete(deleteLasik);

export default lasikRouter;


