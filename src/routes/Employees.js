import express from "express";

import {
  employeeLogin,
  employessOtpVerify,
  resendOTP,
  updateEmployee,
  createEmployee,
  getAllEmployee,
  getByIdEmployee,
  getAllEmployeeDrp,
  deleteEmp,updateEmprelive,getMultiDrp
} from "../controllers/Employees.js";
import { empImageUpload ,uploadCompanyImages } from "../utils/multerConfig.js";

const employeeRouter = express.Router();

employeeRouter.route("/resendotp").post(resendOTP);

employeeRouter.route("/login").post(employeeLogin);

employeeRouter.route("/otp-verify").post(employessOtpVerify);

employeeRouter
  .route("/")
  .get(getAllEmployee)
  .post(empImageUpload, createEmployee).delete(deleteEmp);

employeeRouter
  .route("/updateEmp")
  .patch(empImageUpload, updateEmployee)
  .get(getByIdEmployee);
employeeRouter.route("/getAllEmployeeDrp").get(getAllEmployeeDrp);

employeeRouter.route("/updateEmprelive").patch(uploadCompanyImages,updateEmprelive).get(getMultiDrp)

export default employeeRouter;
