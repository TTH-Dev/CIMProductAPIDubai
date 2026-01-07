import express from 'express';
import {
    createProductUsageMonitor,
    getAllProductUsageMonitors,
    getProductUsageMonitor,
    updateProductUsageMonitor,
    deleteProductUsageMonitor,
    filterProductUsageMonitors,
} from "../controllers/productMonitor.js";

import { protect } from '../controllers/admin.js';

const productUsageMonitorRouter = express.Router();

productUsageMonitorRouter.use(protect);

productUsageMonitorRouter.route("/")
    .get(getAllProductUsageMonitors)
    .post(createProductUsageMonitor);

productUsageMonitorRouter.route("/filter").get(filterProductUsageMonitors);

productUsageMonitorRouter.route("/:id")
    .get(getProductUsageMonitor)
    .patch(updateProductUsageMonitor)
    .delete(deleteProductUsageMonitor);


export default productUsageMonitorRouter;
