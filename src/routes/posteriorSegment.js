import express from "express";
import {
    createPosteriorSegment,
    getAllPosteriorSegments,
    getPosteriorSegment,
    updatePosteriorSegment,
    deletePosteriorSegment
} from "../controllers/posteriorSegment.js";

import { uploadCompanyImages } from "../utils/multerConfig.js";

const posteriorSegmentrouter = express.Router();

posteriorSegmentrouter
    .route("/")
    .post(uploadCompanyImages,createPosteriorSegment)
    .get(getAllPosteriorSegments);

posteriorSegmentrouter
    .route("/:id")
    .get(getPosteriorSegment)
    .patch(uploadCompanyImages,updatePosteriorSegment)
    .delete(deletePosteriorSegment);

export default posteriorSegmentrouter;
