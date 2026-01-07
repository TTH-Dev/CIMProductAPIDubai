import express from 'express';
import { getDoctorDashboard } from '../controllers/Dashboard/doctors.js';
import { getPatientDashboard } from '../controllers/Dashboard/patient.js';
import { getRevenueDashboard } from '../controllers/Dashboard/revenue.js';
import { getCostAnalysis } from '../controllers/Dashboard/costAnalysis.js';
import { getTestDashboard } from '../controllers/Dashboard/test.js';
import { getMedicineDashboard } from '../controllers/Dashboard/drugUsage.js';
import { getExpiryAlertDashboard } from '../controllers/Dashboard/expiry.js';
import { getRevenueByBranchDashboard } from '../controllers/Dashboard/branchReport.js';



const dashboardRouter = express.Router();


dashboardRouter.route("/dashboard-costAnalysis").get(getCostAnalysis);
dashboardRouter.route("/dashboard-doctor").get(getDoctorDashboard);
dashboardRouter.route("/dashboard-patient").get(getPatientDashboard); 
dashboardRouter.route("/dashboard-revenue").get(getRevenueDashboard);
dashboardRouter.route("/dashboard-test").get(getTestDashboard); 
dashboardRouter.route("/dashboard-drug").get(getMedicineDashboard); 
dashboardRouter.route("/dashboard-expiry").get(getExpiryAlertDashboard); 
dashboardRouter.route("/dashboard-branch").get(getRevenueByBranchDashboard);

export default dashboardRouter;
