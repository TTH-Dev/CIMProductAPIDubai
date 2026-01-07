import express from 'express';
import {
    createTemperatureMonitor,
    getAllTemperatureMonitors,
    getTemperatureMonitorById,
    updateTemperatureMonitor,
    deleteTemperatureMonitor,
    getAllPlaceNames,
    filterTemperatureMonitor

} from "../controllers/TemperatureMonitor.js"

import { protect } from '../controllers/admin.js';

const temperatureMonitorRouter = express.Router();

temperatureMonitorRouter.use(protect);

temperatureMonitorRouter.route("/")
    .get(getAllTemperatureMonitors)
    .post(createTemperatureMonitor);

temperatureMonitorRouter.route("/filter").get(filterTemperatureMonitor);

temperatureMonitorRouter.route("/dm-menu").get(getAllPlaceNames);

temperatureMonitorRouter.route("/:id")
    .get(getTemperatureMonitorById)
    .patch(updateTemperatureMonitor)
    .delete(deleteTemperatureMonitor);


export default temperatureMonitorRouter;
