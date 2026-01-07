import express from "express";

import {
  createAppointment,
  getAllAppointments,
  getAppointment,
  updateAppointment,
  deleteAppointment,
  filterAppointment,
  updateQueue,updateAppData
} from "../controllers/appointment.js";
import { protect } from "../controllers/admin.js";

const appointmentRouter = express.Router();

appointmentRouter.use(protect);

appointmentRouter.route("/").get(getAllAppointments).post(createAppointment).patch(updateQueue);
  appointmentRouter.route("/getByIdCancel").patch(updateAppData)

appointmentRouter
  .route("/getById/:id")
  .get(getAppointment)
  .patch(updateAppointment)
  .delete(deleteAppointment);


  

appointmentRouter.get("/filter", filterAppointment);

export default appointmentRouter;
