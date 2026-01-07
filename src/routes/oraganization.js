import express from "express";
import {
    createOrganization,
    getAllOrganizations,
    getOrganizationById,
    updateOrganization,
    deleteOrganization,
    getDueOrganizations,contatUsapi
} from "../controllers/oraganization.js";
import { protect } from "../controllers/admin.js";
import { uploadCompanyImages } from "../utils/multerConfig.js";
const oraganizationrouter = express.Router();

// oraganizationrouter.use(protect);

oraganizationrouter.route("/")
    .get(getAllOrganizations)
    .post(uploadCompanyImages,createOrganization);

     oraganizationrouter.route("/due-soon").get(getDueOrganizations)   
     oraganizationrouter.route("/contatUsapi").post(contatUsapi)

oraganizationrouter.route("/:id")
    .get(getOrganizationById)
    .patch(uploadCompanyImages, updateOrganization)
    .delete(deleteOrganization);

export default oraganizationrouter;
