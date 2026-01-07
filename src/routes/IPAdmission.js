import express from "express";
import {
    createIPAdmission,
    getAllIPAdmissions,
} from "../controllers/IPAdmission.js";

import { protect } from "../controllers/admin.js";

const ipAdmissionrouter = express.Router();

ipAdmissionrouter.use(protect);

ipAdmissionrouter.route("/").get(getAllIPAdmissions).post(createIPAdmission);

export default ipAdmissionrouter;
