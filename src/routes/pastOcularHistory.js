import express from "express";
import {
    createPastOcularHistory,
    getAllPastOcularHistories,
    getPastOcularHistoryById,
    updatePastOcularHistory,
    deletePastOcularHistory,
} from "../controllers/pastOcularHistory.js";

import { protect } from "../controllers/admin.js";

const pastOcularHistoryRouter = express.Router();

pastOcularHistoryRouter.use(protect);

pastOcularHistoryRouter.route("/getById/:id")
    .get(getPastOcularHistoryById)
    .patch(updatePastOcularHistory)
    .delete(deletePastOcularHistory);

pastOcularHistoryRouter.route("/")
    .get(getAllPastOcularHistories)
    .post(createPastOcularHistory);

export default pastOcularHistoryRouter;
