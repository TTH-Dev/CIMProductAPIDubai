import express from "express";
import doctorRouter from "./src/routes/Doctor.js";
import patientRouter from "./src/routes/patient.js";
import adminRouter from "./src/routes/admin.js";
import appointmentRouter from "./src/routes/appointment.js";
import subadminRouter from "./src/routes/subAdmin.js";
import chiefComplaintsRouter from "./src/routes/cheifComplaints.js";
import associatedComplaintsRouter from "./src/routes/associatedComplaints.js";
import pastHistoryRouter from "./src/routes/pastHistory.js";
import pastOcularHistoryRouter from "./src/routes/pastOcularHistory.js";
import refractionSheetRouter from "./src/routes/refractionSheet.js";
import otherRoutineTestRouter from "./src/routes/OtherRoutineTest.js";
import ipAdmissionrouter from "./src/routes/IPAdmission.js";
import prescribeTestrouter from "./src/routes/PrescribeTest.js";
import Prescriptionrouter from "./src/routes/Prescription.js";
import oraganizationrouter from "./src/routes/oraganization.js";
import consultyFeedrouter from "./src/routes/consultyFeed.js";
import billingRouter from "./src/routes/billing.js";
import productsRouter from "./src/routes/products.js";
import vendorRouter from "./src/routes/vendor.js";
import testRouter from "./src/routes/test.js";
import purchaseRouter from "./src/routes/purchase.js";
import productUsageMonitorRouter from "./src/routes/productMonitor.js";
import temperatureMonitorRouter from "./src/routes/TemperatureMonitor.js";
import pharmacyProductrouter from "./src/routes/PharmacyProduct.js";
import pharmacyVendorrouter from "./src/routes/pharmacyVendor.js";
import squintRouter from "./src/routes/squint.js";
import glaucomaRouter from "./src/routes/glaucoma.js";
import contactLensTestRouter from "./src/routes/contackLensTest.js";
import notesRouter from "./src/routes/notes.js";
import lasikRouter from "./src/routes/lasik.js";
import pharmacyPurchaseRouter from "./src/routes/pharmact-purchase.js";
import provisionalDiagnosisRouter from "./src/routes/provisionalDiagnosis.js";
import planOfManageMentRouter from "./src/routes/planOfManageMent.js";
import posteriorSegmentrouter from "./src/routes/posteriorSegment.js";
import antriorSegmentrouter from "./src/routes/antriorSegment.js";
import websiteUserRouter from "./src/routes/websiteUser.js";
import opticalVendorRouter from "./src/routes/Optical/opticalVendor.js";
import opticalProductRouter from "./src/routes/Optical/OpticalProducts.js";
import opticalPurchaseRouter from "./src/routes/Optical/OpticalPurchase.js";
import opticalValuesRouter from "./src/routes/Optical/opticalValues.js";
import opticalBillingRouter from "./src/routes/Optical/opticalBilling.js";
import biometryRouter from "./src/routes/biometry.js";
import surgeryRouter from "./src/routes/surgery.js";
import surgeryDetailsRouter from "./src/routes/surgeryDetails.js";
import wardRouter from "./src/routes/ward.js";
import wardManagementRouter from "./src/routes/wardManagement.js";
import admissionFormRouter from "./src/routes/ot/admissionForm.js";
import anestheticsAssessmentRouter from "./src/routes/ot/anestheticsAssessment.js";
import anestheticsNotesRouter from "./src/routes/ot/anesthetistNotes.js";
import dischargeConsentRouter from "./src/routes/ot/dischargeconsent.js";
import dischargeSummeryRouter from "./src/routes/ot/dischargeSummery.js";
import preAnestheticFitnessRouter from "./src/routes/ot/preAnestheticFitness.js";
import preOperativeChecklistRouter from "./src/routes/ot/preoperativeChecklist.js";
import surgeryNotesRouter from "./src/routes/ot/surgeryNotes.js";
import surgicalSafetyCheckListsRouter from "./src/routes/ot/surgicalSafetyChecklits.js";
import otRequestRouter from "./src/routes/otRequest.js";
import tpaDischargeFormRouter from "./src/routes/tpaDischargeSummery.js";
import tpaPreAuthorizationFormRouter from "./src/routes/tpaPreAuthorizationForm.js";
import tpaRouter from "./src/routes/tpaManagement.js";
import manualbillingRouter from "./src/routes/manualBilling.js";
import campbillingRouter from "./src/routes/campIndents.js";
import doctorIndentsRouter from "./src/routes/doctorIndentsRouter.js";
import velacheryIndentsRouter from "./src/routes/velacheryIndent.js";
import demoRouter from "./src/routes/demoRouter.js";
import superadminRouter from "./src/routes/superadminRouter.js";
import supersubadminRouter from "./src/routes/supersubadminRouter.js";
import employeeRouter from "./src/routes/Employees.js";
import vitalsRouter from "./src/routes/Vitals.js";
import allergiesRouter from "./src/routes/allergies.js";
import medicalHistoryRouter from "./src/routes/medicalHistory.js";
import examRouter from "./src/routes/Examination.js";
import attachmentRouter from "./src/routes/attachments.js";
import usageRouter from "./src/routes/userAnalysis.js";
import trailRouter from "./src/routes/trail.js";
import treatmentRouter from "./src/routes/treatment.js";
import dentalHistoryRouter from "./src/routes/dentalHistory.js";
import dentalChartRouter from "./src/routes/dentalChart.js";
import treatmentPlanRouter from "./src/routes/treatmentPlan.js";
import dentalAdviceRouter from "./src/routes/dentalAdvice.js";
import branchRouter from "./src/routes/branch.js"
import dashboardRouter from "./src/routes/dashboard.js";
import notifyRouter from "./src/routes/notify.js";
import ticketRouter from "./src/routes/ticket.js";
import pharmacyProductRequestRouter from "./src/routes/pharmacyProductRequest.js"

const router = express.Router();

router.use("/tpa", tpaRouter);

router.use("/tpa-paf", tpaPreAuthorizationFormRouter);

router.use("/tpa-ds", tpaDischargeFormRouter);

router.use("/otRequest", otRequestRouter);

router.use("/admissionForm", admissionFormRouter);

router.use("/anestheticsAssessment", anestheticsAssessmentRouter);

router.use("/anestheticsNotes", anestheticsNotesRouter);

router.use("/dischargeConsent", dischargeConsentRouter);

router.use("/dischargeSummery", dischargeSummeryRouter);

router.use("/preAnestheticFitness", preAnestheticFitnessRouter);

router.use("/preOperativeChecklist", preOperativeChecklistRouter);

router.use("/surgeryNotes", surgeryNotesRouter);

router.use("/surgicalSafetyCheckLists", surgicalSafetyCheckListsRouter);

router.use("/ward-management", wardManagementRouter);

router.use("/surgery", surgeryRouter);

router.use("/surgery-details", surgeryDetailsRouter);

router.use("/biometry", biometryRouter);

router.use("/optical-billing", opticalBillingRouter);

router.use("/optical-product", opticalProductRouter);

router.use("/optical-values", opticalValuesRouter);

router.use("/optical-purchase", opticalPurchaseRouter);

router.use("/optical-vendor", opticalVendorRouter);

router.use("/website-user", websiteUserRouter);

router.use("/plan-of-management", planOfManageMentRouter);

router.use("/posteriorSegment", posteriorSegmentrouter);

router.use("/antriorSegment", antriorSegmentrouter);

router.use("/provisional-diagnosis", provisionalDiagnosisRouter);

router.use("/glaucoma", glaucomaRouter);

router.use("/lasik", lasikRouter);

router.use("/attach", attachmentRouter);

router.use("/notes", notesRouter);

router.use("/pharmacy-purchase", pharmacyPurchaseRouter);

router.use("/contact-lens-test", contactLensTestRouter);

router.use("/pharmacy-vendor", pharmacyVendorrouter);

router.use("/squint", squintRouter);

router.use("/db", dashboardRouter)

router.use("/test", testRouter);

router.use("/medical-history", medicalHistoryRouter);

router.use("/pharmacy-product", pharmacyProductrouter);

router.use("/temperature-monitor", temperatureMonitorRouter);

router.use("/product-usage-monitor", productUsageMonitorRouter);

router.use("/purchase", purchaseRouter);

router.use("/billing", billingRouter);

router.use("/vendor", vendorRouter);

router.use("/product", productsRouter);

router.use("/organization", oraganizationrouter);

router.use("/consulty-fees", consultyFeedrouter);

router.use("/prescribe-test", prescribeTestrouter);

router.use("/ip-admission", ipAdmissionrouter);

router.use("/prescription", Prescriptionrouter);

router.use("/other-routine-test", otherRoutineTestRouter);

router.use("/chief-complaint", chiefComplaintsRouter);

router.use("/vitals", vitalsRouter);

router.use("/allergies", allergiesRouter);

router.use("/associated-complaints", associatedComplaintsRouter);

router.use("/past-history", pastHistoryRouter);

router.use("/past-ocular-history", pastOcularHistoryRouter);

router.use("/refraction-sheet", refractionSheetRouter);

router.use("/admin", adminRouter);

router.use("/appointment", appointmentRouter);

router.use("/doctor", doctorRouter);

router.use("/usage-analytical", usageRouter);

router.use("/patient", patientRouter);

router.use("/subadmin", subadminRouter);

router.use("/ward", wardRouter);

router.use("/manualBilling", manualbillingRouter);

router.use("/campBilling", campbillingRouter);

router.use("/doctorIndents", doctorIndentsRouter);

router.use("/velacheryIndents", velacheryIndentsRouter);

router.use("/demo", demoRouter);

router.use("/superadmin", superadminRouter);

router.use("/supersubadmin", supersubadminRouter);

router.use("/employees", employeeRouter);

router.use("/examination", examRouter);

router.use("/trail", trailRouter);

router.use("/treatment", treatmentRouter);

router.use("/dental-history", dentalHistoryRouter);

router.use("/dental-chart", dentalChartRouter);

router.use("/treatment-plan",treatmentPlanRouter);

router.use("/dental-advice",dentalAdviceRouter);

router.use("/branch",branchRouter)

router.use("/notify",notifyRouter)

router.use("/ticket",ticketRouter)

router.use("/pharmacyProdRequest",pharmacyProductRequestRouter)

export default router;
