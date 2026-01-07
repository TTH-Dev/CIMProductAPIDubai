import express from 'express';
import {
    createOtRequiredProduct,
    getAllRequiredProdts,
    requestOtProduct,
    approveOtProductRequests,
    createOtRequiredLens,
    getAllRequiredLens,
    getAllRequest,
    getRequestById,
    delall,
    updateOtRequiredStock,
    updateOtRequiredAfterUsage,
    deleteOtRequest,
    editOtRequest,
    getOtresquestById,
    deleteOtrequestLeans,
    editOtlen,
    getOtLensById
} from "../controllers/otRequest.js"

const otRequestRouter = express.Router();

otRequestRouter.delete("/", delall);

otRequestRouter.post("/lens-add", createOtRequiredLens);

otRequestRouter.get("/", getAllRequiredProdts);

otRequestRouter.get("/lens", getAllRequiredLens);

otRequestRouter.post("/", createOtRequiredProduct);

otRequestRouter.post("/request", requestOtProduct);

otRequestRouter.get("/request", getAllRequest);

otRequestRouter.get("/request/:id", getRequestById);

otRequestRouter.patch("/approve/:requestId", approveOtProductRequests);

otRequestRouter.patch("/update/:requestId", updateOtRequiredStock);

otRequestRouter.patch("/consume", updateOtRequiredAfterUsage);

otRequestRouter.delete("/deleteOtrequest",deleteOtRequest)
otRequestRouter.patch("/editOtrequest/:id",editOtRequest)
otRequestRouter.get("/otrequestbyId/:id",getOtresquestById)
otRequestRouter.delete("/deletelens/:id",deleteOtrequestLeans)
otRequestRouter.patch("/editOtLens/:id",editOtlen)
otRequestRouter.get("/otLensById/:id",getOtLensById)

export default otRequestRouter;