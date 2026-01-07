import express from "express";
import {
    createDentalChart,
    getAllDentalChart,
    getDentalChartById,
    updateDentalChart,
    deleteDentalChart,
} from "../controllers/dentalChart.js";

import { protect } from "../controllers/admin.js";

const dentalChartRouter = express.Router();

dentalChartRouter.use(protect);

dentalChartRouter.route("/")
    .get(getAllDentalChart)
    .post(createDentalChart);

dentalChartRouter.route("/getById/:id")
    .get(getDentalChartById)
    .patch(updateDentalChart)
    .delete(deleteDentalChart);



export default dentalChartRouter;
