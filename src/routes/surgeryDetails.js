import express from "express";
import {
    createSurgeryDetails,
    getAllSurgeryDetails,
    getSurgeryDetails,
    updateSurgeryDetails,
    deleteSurgeryDetails,
    filterSurgeryDetails,
    updateSurgeryBillDetails
} from "../controllers/surgeryDetails.js";

const surgeryDetailsRouter = express.Router();

surgeryDetailsRouter.get("/filter", filterSurgeryDetails);

surgeryDetailsRouter
    .route("/")
    .get(getAllSurgeryDetails)
    .post(createSurgeryDetails);
    
surgeryDetailsRouter.patch("/add-bill/:id", updateSurgeryBillDetails);

surgeryDetailsRouter
    .route("/:id")
    .patch(updateSurgeryDetails)
    .get(getSurgeryDetails)
    .delete(deleteSurgeryDetails);


export default surgeryDetailsRouter;
