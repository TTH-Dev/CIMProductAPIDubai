import express from "express";
import {
    createDentalAdvice,
    getAllDentalAdvice,
    getDentalAdviceById,
    updateDentalAdvice,
} from "../controllers/dentalAdvice.js";

import { protect } from "../controllers/admin.js";

const dentalAdviceRouter = express.Router();

dentalAdviceRouter.use(protect);

dentalAdviceRouter.route("/getById").patch(updateDentalAdvice).get(getDentalAdviceById)
 

dentalAdviceRouter.route("/")
    .get(getAllDentalAdvice)
    .post(createDentalAdvice);

export default dentalAdviceRouter;
