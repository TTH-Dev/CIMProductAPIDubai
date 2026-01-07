import express from 'express';
import {
    createSurgicalSafetyCheckList,
    getAllSurgicalSafetyCheckLists,
    getSurgicalSafetyCheckList,
    updateSurgicalSafetyCheckList,
    deleteSurgicalSafetyCheckList
} from "../../controllers/ot/surgicalSafetyChecklits.js";
import { protect } from '../../controllers/admin.js';
import { uploadCompanyImages } from "../../utils/multerConfig.js";

const surgicalSafetyCheckListsRouter = express.Router();

surgicalSafetyCheckListsRouter.use(protect);

surgicalSafetyCheckListsRouter.route("/")
    .post(uploadCompanyImages, createSurgicalSafetyCheckList)
    .get(getAllSurgicalSafetyCheckLists);

surgicalSafetyCheckListsRouter.route("/:id")
    .get(getSurgicalSafetyCheckList)
    .patch(uploadCompanyImages, updateSurgicalSafetyCheckList)
    .delete(deleteSurgicalSafetyCheckList);

export default surgicalSafetyCheckListsRouter;
