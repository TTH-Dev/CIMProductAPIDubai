import express from "express";
import {
    createTPADischargeSummery,
    getAllDischargeSummaries,
    getTPADischargeSummeryById,
    updateTPADischargeSummery,
    deleteTPADischargeSummery
} from "../controllers/tpaDischargeSummery.js";

const tpaDischargeFormRouter = express.Router();

tpaDischargeFormRouter.route("/")
    .post(createTPADischargeSummery)
    .get(getAllDischargeSummaries);

tpaDischargeFormRouter.route("/:id")
    .get(getTPADischargeSummeryById)
    .put(updateTPADischargeSummery)
    .delete(deleteTPADischargeSummery);

export default tpaDischargeFormRouter;
