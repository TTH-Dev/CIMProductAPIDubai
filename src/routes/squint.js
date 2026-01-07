import express from 'express';
import {
    createSquint,
    getAllSquints,
    getSquint,
    updateSquint,
    deleteSquint
} from "../controllers/squint.js";
import { protect } from '../controllers/admin.js';
import { uploadCompanyImages } from "../utils/multerConfig.js";


const squintRouter = express.Router();


squintRouter.use(protect);

squintRouter.route("/")
    .post(uploadCompanyImages, createSquint)
    .get(getAllSquints);

squintRouter.route("/:id")
    .get(getSquint)
    .patch(uploadCompanyImages, updateSquint)
    .delete(deleteSquint);

export default squintRouter;


