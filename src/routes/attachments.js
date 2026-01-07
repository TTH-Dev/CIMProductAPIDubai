import express from "express";
import {
    createattachments,
    getAllattachments,
    getAttachmentById,
    updateAttachments,
    deleteAttachment,
} from "../controllers/attachments.js";
import {attachmentUpload} from "../utils/multerConfig.js"

import { protect } from "../controllers/admin.js";

const attachmentRouter = express.Router();

attachmentRouter.use(protect);

attachmentRouter.route("/getById/:id")
    .get(getAttachmentById)
    .patch(attachmentUpload,updateAttachments)
    .delete(deleteAttachment);

attachmentRouter.route("/")
    .get(getAllattachments)
    .post(attachmentUpload,createattachments);

export default attachmentRouter;
