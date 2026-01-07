import express from 'express';
import {
    createDischargeConsent,
    getAllDischargeConsents,
    getDischargeConsent,
    updateDischargeConsent,
    deleteDischargeConsent
} from "../../controllers/ot/dischargeconsent.js";
import { protect } from '../../controllers/admin.js';
import { uploadCompanyImages } from "../../utils/multerConfig.js";

const dischargeConsentRouter = express.Router();

dischargeConsentRouter.use(protect);

dischargeConsentRouter.route("/")
    .post(uploadCompanyImages, createDischargeConsent)
    .get(getAllDischargeConsents);

dischargeConsentRouter.route("/:id")
    .get(getDischargeConsent)
    .patch(uploadCompanyImages, updateDischargeConsent)
    .delete(deleteDischargeConsent);

export default dischargeConsentRouter;
