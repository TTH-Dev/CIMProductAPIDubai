import express from 'express';

import {
    createDoctor,
    getAllDoctors,
    getDoctor,
    updateDoctor,
    deleteDoctor,
    updateShift,
    filterDoctor,
    getDoctorDMenu,
    filterDoctorSlot,
    getAllDoctorAvailability,
    getDoctorOverview,
    getHomeRevenue,getSpecialist
} from "../controllers/Doctor.js";

import { uploadDRImage } from "../utils/multerConfig.js";

import { protect } from '../controllers/admin.js';
const doctorRouter = express.Router();

// doctorRouter.use(protect);
doctorRouter.route("/")
    .post(uploadDRImage, createDoctor)
    .get(getAllDoctors);

doctorRouter.route("/today-doctor").get(getAllDoctorAvailability);

doctorRouter.route("/shift").post(updateShift);

doctorRouter.route("/d-menu").get(getDoctorDMenu);
doctorRouter.route("/d-overview").get(getDoctorOverview);

doctorRouter.route("/filter-slot").get(filterDoctorSlot);
doctorRouter.route("/getSpecialist").get(getSpecialist)

doctorRouter.route("/ById/:id")
    .get(getDoctor)
    .patch(uploadDRImage, updateDoctor)
    .delete(deleteDoctor);

doctorRouter.route("/filter").get(filterDoctor);

doctorRouter.route("/revenue-home").get(getHomeRevenue)


export default doctorRouter;
