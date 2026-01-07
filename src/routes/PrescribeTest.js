import express from "express";
import {
    createPrescribeTest,
    getAllPrescribeTests,
    getPrescribeTestById,
    updatePrescribeTest,
    deletePrescribeTest,
    CreateLapReport,
    getAllLapReports,
    addLapReportPdf,
    getAllReports,
    getLapReportById
} from "../controllers/PrescribeTest.js";

import { protect } from "../controllers/admin.js";

import { uploadCompanyImages } from "../utils/multerConfig.js"
const prescribeTestrouter = express.Router();

prescribeTestrouter.use(protect);
prescribeTestrouter.route("/getById-report/:id").get(getLapReportById);


prescribeTestrouter.route("/add-report/:id").patch(uploadCompanyImages, addLapReportPdf);

prescribeTestrouter.route("/get-reports").get(getAllLapReports);

prescribeTestrouter.route("/lap-report").post(CreateLapReport);

prescribeTestrouter.get("/get-bothReport", getAllReports);

prescribeTestrouter.route("/").get(getAllPrescribeTests).post(createPrescribeTest);
prescribeTestrouter.route("/:id").get(getPrescribeTestById).patch(updatePrescribeTest).delete(deletePrescribeTest);

export default prescribeTestrouter;
