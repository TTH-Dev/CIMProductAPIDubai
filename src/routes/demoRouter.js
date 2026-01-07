import express from "express";
import { createdemo, getAlldemo, editdemo, demoById } from "../controllers/demo.js";

const demoRouter = express.Router();

demoRouter.route("/").post(createdemo).get(getAlldemo).patch(editdemo);

demoRouter.route("/demoById").get(demoById)

export default demoRouter;
