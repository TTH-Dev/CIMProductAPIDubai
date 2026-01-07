import express from "express";
import {
  createExamination,
  getAllexam,
  getExamById,
  updateExam,
  deleteExam,
} from "../controllers/Examination.js";

import { protect } from "../controllers/admin.js";

const examRouter = express.Router();

examRouter.use(protect);

examRouter
  .route("/getById/:id")
  .get(getExamById)
  .patch(updateExam)
  .delete(deleteExam);

examRouter.route("/").get(getAllexam).post(createExamination);

export default examRouter;
