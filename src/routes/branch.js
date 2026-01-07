import express from "express";
import {
  createBranch,
  getAllBranch,
  getBranchStaff,
  getBranchAnalytical,
  branchOverView,
  getBranchById,
  updateBranchById,
  deleteBranchById,
  getStaffAnalytical,
  getBranchDmMenu,getBranchDoctorVisits,higiActivity
} from "../controllers/branch.js";
import { protect } from "../controllers/admin.js";

const branchRouter = express.Router();

branchRouter.use(protect);

branchRouter.route("/").post(createBranch).get(getAllBranch);

branchRouter
  .route("/branchById")
  .get(getBranchById)
  .patch(updateBranchById)
  .delete(deleteBranchById);
branchRouter.route("/branchOverView").get(branchOverView);
branchRouter.route("/getBranchStaff").get(getBranchStaff);
branchRouter.route("/getBranchAnalytical").get(getBranchAnalytical);
branchRouter.route("/getStaffAnalytical").get(getStaffAnalytical)
branchRouter.route("/getBranchDmMenu").get(getBranchDmMenu)
branchRouter.route("/getBranchDoctorVisits").get(getBranchDoctorVisits)
branchRouter.route("/higiActivity").get(higiActivity)
export default branchRouter;
