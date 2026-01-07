import express from 'express';

import {
    createPatient,
    getAllPatients,
    getPatient,
    updatePatient,
    deletePatient,
    updateOpIp,
    updateMultiplePatientFields,
    createOutPatient,
    filterPatient,
    createappPatient,
    filterOutPatient,
    filterOutPatientsAndAppointments,
    getOpPatient,
    DeleteOpPatient,
    getSortedPatientAndAppointments,
    addTestedBy,
    chaneOpStatusOrAPstatus,
    getAllTestedBy,
    filteremrPatient,
    getAllDmmenu,
    filterPatientAttachment,
    replaceAttachment,
    getPatientStats,
    siteAppBooking,
    updateOutpatient,
    filterPInPatient,
    getPatientsWithSurgeryTwoDaysAgo,
    getTPAPatients,
    getAllPatientData,
    getNonGenBilling,
    getPatientsWithSurgeryManagement,
    filterEmr,
    getHomeData,
    updateQueueList,
    getOPAPPatientById,
    updateOPAPById,filterPatientName
} from "../controllers/patient.js";

import { uploadCompanyImages } from "../utils/multerConfig.js";
import { protect } from '../controllers/admin.js';
const patientRouter = express.Router();

patientRouter.route("/site-app-patint").post(siteAppBooking);

patientRouter.use(protect);

patientRouter.route("/")
    .post(uploadCompanyImages, createPatient)
    .get(getAllPatients);

patientRouter.route("/tpa").get(getTPAPatients);

patientRouter.route("/surgery-management").get(getPatientsWithSurgeryManagement);

patientRouter.route("/home-stats").get(getPatientStats);

patientRouter.route("/add-testedBy/:id").post(addTestedBy);

patientRouter.route("/edit-status").post(chaneOpStatusOrAPstatus);

patientRouter.route("/dm-data").get(getAllDmmenu);

patientRouter.route("/emr-filter-data").get(filteremrPatient);

patientRouter.route("/testedBy-data").get(getAllTestedBy);

patientRouter.route("/add-app-patint").post(createappPatient);

patientRouter.route("/create-emr-data").get(filterEmr);

patientRouter.route("/emr-data").get(filterOutPatientsAndAppointments);

patientRouter.route("/opto-data").get(getSortedPatientAndAppointments);

patientRouter.route("/opto-bill-data").get(getNonGenBilling);

patientRouter.route("/shift").post(updateOpIp);

patientRouter.route("/add-op").post(uploadCompanyImages,createOutPatient);

patientRouter.route("/edit").post(updateMultiplePatientFields);

patientRouter.route("/ip-filter").get(filterPInPatient);

patientRouter.route("/pre-ot").get(getPatientsWithSurgeryTwoDaysAgo);

patientRouter.route("/op-filter").get(filterOutPatient);

patientRouter.route("/filter").get(filterPatient);

patientRouter.route("/get-attachments").get(filterPatientAttachment);

patientRouter.route("/get-op/:id").get(getOpPatient);

patientRouter.route("/del-op/:id").delete(DeleteOpPatient);

patientRouter.route("/edit-op/:id").patch(updateOutpatient);

patientRouter.route("/replace-attachement").post(uploadCompanyImages, replaceAttachment);
patientRouter.route("/getdropModal").get(getAllPatientData)
patientRouter.route("/home").get(getHomeData)

patientRouter.route("/updateQueueList").patch(updateQueueList)
patientRouter.route("/getOPAPPatientById").get(getOPAPPatientById).patch(updateOPAPById)

patientRouter.route("/:id")
    .get(getPatient)
    .patch(uploadCompanyImages, updatePatient)
    .delete(deletePatient);


patientRouter.route("/filterPatientName").get(filterPatientName)    

export default patientRouter;
