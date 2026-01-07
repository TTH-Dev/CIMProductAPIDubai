import express from "express";
import {
    createAnteriorSegment,
    getAllAnteriorSegments,
    getAnteriorSegment,
    updateAnteriorSegment,
    deleteAnteriorSegment
} from "../controllers/antriorSegment.js";

const antriorSegmentrouter = express.Router();

antriorSegmentrouter
    .route("/")
    .post(createAnteriorSegment)
    .get(getAllAnteriorSegments);

antriorSegmentrouter
    .route("/:id")
    .get(getAnteriorSegment)
    .patch(updateAnteriorSegment)
    .delete(deleteAnteriorSegment);

export default antriorSegmentrouter;
