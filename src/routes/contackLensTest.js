import express from "express";
import {
    createContactLensTest,
    getAllContactLensTests,
    getContactLensTestById,
    updateContactLensTest,
    deleteContactLensTest,
} from "../controllers/contackLensTest.js";

import { protect } from "../controllers/admin.js";
import { uploadCompanyImages } from "../utils/multerConfig.js";

const contactLensTestRouter = express.Router();

contactLensTestRouter.use(protect);

contactLensTestRouter.route("/getById/:id")
    .get(getContactLensTestById)
    .patch(uploadCompanyImages,updateContactLensTest)
    .delete(deleteContactLensTest);

contactLensTestRouter.route("/")
    .get(getAllContactLensTests)
    .post(uploadCompanyImages,createContactLensTest);

export default contactLensTestRouter;
