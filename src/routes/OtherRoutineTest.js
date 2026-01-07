import express from "express";
import {
    createOtherRoutineTest,
    getAllOtherRoutineTests,
    getOtherRoutineTestById,
    updateOtherRoutineTest,
    deleteOtherRoutineTest,
    updateOtherRoutineTestSection,
    getOtherRoutineTest,
    updateOtherRoutineTestObjectSection,
    getOtherRoutineByDate,
    getAntiorExcel,
    changeOtherRoutineTestSection,
    updateOtherRoutineTestSectionImages
} from "../controllers/OtherRoutineTest.js";
import { protect } from "../controllers/admin.js";
import { uploadCompanyImages } from "../utils/multerConfig.js";

const otherRoutineTestRouter = express.Router();

otherRoutineTestRouter.use(protect);

otherRoutineTestRouter.get("/getExcel", getAntiorExcel);
otherRoutineTestRouter.route("/")
    .post(createOtherRoutineTest)
    .get(getAllOtherRoutineTests);

otherRoutineTestRouter.get("/get-by-date", getOtherRoutineByDate);

otherRoutineTestRouter.post("/add", uploadCompanyImages, updateOtherRoutineTestSection);

otherRoutineTestRouter.post("/add-data", updateOtherRoutineTestObjectSection);

otherRoutineTestRouter.get("/get", getOtherRoutineTest);

otherRoutineTestRouter.post("/edit-image/:id",uploadCompanyImages,updateOtherRoutineTestSectionImages);

otherRoutineTestRouter.post("/edit-data/:id", changeOtherRoutineTestSection);

otherRoutineTestRouter.route("/:id")
    .get(getOtherRoutineTestById)
    .patch(updateOtherRoutineTest)
    .delete(deleteOtherRoutineTest);

export default otherRoutineTestRouter;
