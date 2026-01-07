import express from 'express';

import {
    createOpticalValues,
    getAllOpticalValues,
    getOpticalValuesById,
    updateOpticalValues,
    deleteOpticalValues
} from "../../controllers/Optical/opticalValues.js";

import { protect } from '../../controllers/admin.js';

const opticalValuesRouter = express.Router();

opticalValuesRouter.use(protect);

opticalValuesRouter.route("/getById/:id")
    .get(getOpticalValuesById)
    .patch(updateOpticalValues)
    .delete(deleteOpticalValues);

opticalValuesRouter.route("/")
    .get(getAllOpticalValues)
    .post(createOpticalValues);

export default opticalValuesRouter;