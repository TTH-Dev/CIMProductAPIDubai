import express from 'express';
import {
    createTest,
  getAllusage
} from "../controllers/userAnalysis.js";

const usageRouter = express.Router();


usageRouter.route("/")
    .post(createTest)
    .get(getAllusage);

// usageRouter.route("/:id")
//     .get(getNotes)
//     .patch(updateNotes)
//     .delete(deleteNotes);

export default usageRouter;


