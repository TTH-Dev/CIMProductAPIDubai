import express from 'express';
import { protect } from '../controllers/admin.js';
import { updateNotify , getallNotifyById,getAllNotify } from "../controllers/notify.js"
const notifyRouter = express.Router();

notifyRouter.use(protect);

notifyRouter.route("/")
    .get(getallNotifyById)
    .delete(updateNotify);
notifyRouter.route("/getAllNotify").get(getAllNotify)

export default notifyRouter;


