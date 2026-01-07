import express from "express"
import {createTicket,getAllTicket,getTicketById,updateTicketById} from "../controllers/ticket.js"
import { protect } from "../controllers/admin.js";
import {uploadCompanyImages} from "../utils/multerConfig.js"

const ticketRouter=express.Router()

ticketRouter.route("/create-ticket").post(uploadCompanyImages,createTicket)

ticketRouter.use(protect)

ticketRouter.route("/getAllticket").get(getAllTicket)

ticketRouter.route("/getTicketById").get(getTicketById).patch(updateTicketById)

export default ticketRouter