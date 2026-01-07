import express from "express";
import {
    createTest,
    getAllTests,
    getTest,
    updateTest,
    deleteTest,
    filterTests,
    dmMenuTest,
    deleteTestByName
} from "../controllers/test.js";

import { protect } from "../controllers/admin.js";
import {createLabMaster,getAllLabMaster,getLabMasterDrop,getLabMasterById} from "../controllers/labMaster.js"
const testRouter = express.Router();

testRouter.use(protect);

testRouter.route("/")
    .post(createTest)
    .get(getAllTests);

testRouter.route("/dm-menu").get(dmMenuTest);

testRouter.route("/labMaster").post(createLabMaster).get(getAllLabMaster)
testRouter.route("/getLabMasterDrop").get(getLabMasterDrop)
testRouter.route("/getLabMasterById").get(getLabMasterById)
testRouter.route("/deleteTestByName").delete(deleteTestByName)

testRouter.route("/filter").get(filterTests);

testRouter.route("/:id")
    .get(getTest)
    .patch(updateTest)
    .delete(deleteTest);

export default testRouter;
