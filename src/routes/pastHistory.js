import express from "express";
import {
    createPastHistory,
    getAllPastHistories,
    getPastHistoryById,
    updatePastHistory,
    deletePastHistory,
    updatePastHistorySection,
    updatePastHistorySectionData,
    getPastHistorySection
} from "../controllers/pastHistory.js";

import { protect } from "../controllers/admin.js";

const pastHistoryRouter = express.Router();

pastHistoryRouter.use(protect);

pastHistoryRouter.route("/getById/:id")
    .get(getPastHistoryById)
    .patch(updatePastHistory)
    .delete(deletePastHistory);
pastHistoryRouter.route("/edit-section").post(updatePastHistorySectionData);
pastHistoryRouter.route("/getBy-section").get(getPastHistorySection);

pastHistoryRouter.route("/")
    .get(getAllPastHistories)
    .post(updatePastHistorySection);

export default pastHistoryRouter;
