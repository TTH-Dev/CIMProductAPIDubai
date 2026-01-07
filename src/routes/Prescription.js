import express from "express";
import {
    createPrescription,
    getAllPrescriptions,
    getPrescriptionById,
    updatePrescription,
    deletePrescription,
    updatePrescriptionData,
    getAllPrescriptionsBilling,
    createPastOcularHistory,
    editPrescribeBilling,
    getPrescriptionBillingById,
    addPrescribeBillingPdf,
    getAllNurseSations,
    updateNurseStation,
    getNurseStaionsById,prescBillget,updateMedicine,prescBillgetMain
} from "../controllers/Prescription.js";

import { protect } from "../controllers/admin.js";

const Prescriptionrouter = express.Router();

Prescriptionrouter.use(protect);
Prescriptionrouter.route("/create").post(createPastOcularHistory);
Prescriptionrouter.route("/updateMedicine/:prescriptionId/:medicineId").patch(updateMedicine)

Prescriptionrouter.route("/nurse/:id").get(getNurseStaionsById);

Prescriptionrouter.route("/nurse/:id").patch(updateNurseStation);

Prescriptionrouter.route("/nurse").get(getAllNurseSations);

Prescriptionrouter.route("/add-report/:id").patch(addPrescribeBillingPdf);

Prescriptionrouter.route("/get-Bill").get(getAllPrescriptionsBilling);

Prescriptionrouter.route("/prescBillget").get(prescBillget)

Prescriptionrouter.route("/prescBillgetMain").get(prescBillgetMain)

Prescriptionrouter.route("/getBillById/:id").get(getPrescriptionBillingById);

Prescriptionrouter.route("/edit/:id").patch(editPrescribeBilling);

Prescriptionrouter.route("/edit-pr/:id").patch(updatePrescription);

Prescriptionrouter.route("/").get(getAllPrescriptions).post(createPrescription);

Prescriptionrouter.route("/:id").get(getPrescriptionById).patch(updatePrescriptionData).delete(deletePrescription);
export default Prescriptionrouter;
