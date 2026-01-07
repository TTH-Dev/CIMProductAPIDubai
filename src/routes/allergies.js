import express from "express";
import {
    getAllergiesById,
    updateAllergies,
    deleteAllergies,
    getAllAllergies,
    createAllergies,
} from "../controllers/allergies.js";

import { protect } from "../controllers/admin.js";

const allergiesRouter = express.Router();

allergiesRouter.use(protect);

allergiesRouter.route("/getById/:id")
    .get(getAllergiesById)
    .patch(updateAllergies)
    .delete(deleteAllergies);

allergiesRouter.route("/")
    .get(getAllAllergies)
    .post(createAllergies);

export default allergiesRouter;
