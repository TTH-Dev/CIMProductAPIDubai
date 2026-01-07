import express from "express";
import {
    createTPAPreAuthorizationForm,
    getAllTPAPreAuthorizationForms,
    getTPAPreAuthorizationFormById,
    updateTPAPreAuthorizationForm,
    deleteTPAPreAuthorizationForm,
} from "../controllers/tpaPreAuthorizationForm.js";

const tpaPreAuthorizationFormRouter = express.Router();

tpaPreAuthorizationFormRouter.route("/")
    .post(createTPAPreAuthorizationForm)
    .get(getAllTPAPreAuthorizationForms);

tpaPreAuthorizationFormRouter.route("/:id")
    .get(getTPAPreAuthorizationFormById)
    .put(updateTPAPreAuthorizationForm)
    .delete(deleteTPAPreAuthorizationForm);

export default tpaPreAuthorizationFormRouter;
