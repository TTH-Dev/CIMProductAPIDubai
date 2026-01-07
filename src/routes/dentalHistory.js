import express from "express";
import {
    deleteDentalHistory,
    updateDentalHistory,
    getDentalHistoryById,
    getAllDentalHistory,
    createDentalHistory,
} from "../controllers/dentalHistory.js";

import { protect } from "../controllers/admin.js";

const dentalHistoryRouter = express.Router();

dentalHistoryRouter.use(protect);

dentalHistoryRouter.route("/getById/:id")
    .get(getDentalHistoryById)
    .patch(updateDentalHistory)
    .delete(deleteDentalHistory);

dentalHistoryRouter.route("/")
    .get(getAllDentalHistory)
    .post(createDentalHistory);

export default dentalHistoryRouter;
