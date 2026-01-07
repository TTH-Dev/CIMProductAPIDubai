
import express from "express";
import {
    createConsultingFee,
    getAllConsultingFees,
    getConsultingFeeById,
    updateConsultingFee,
    deleteConsultingFee
} from "../controllers/consultyFeed.js";

import { protect } from "../controllers/admin.js";

const consultyFeedrouter = express.Router();

consultyFeedrouter.use(protect);

consultyFeedrouter.route("/")
    .get(getAllConsultingFees)
    .post(createConsultingFee);

consultyFeedrouter.route("/:id")
    .get(getConsultingFeeById)
    .patch(updateConsultingFee)
    .delete(deleteConsultingFee);

export default consultyFeedrouter;
