import express from 'express';
import {
    createWard,
    updateWard,
    deleteWard,
    allocatePatientToBed,
    updateBedInRoom,
    deleteRoomFromWard,
    getAllWards,
    getWardById,
    clearBed,
    getOccupiedBedsWithPatientDetails,
    getWardHierarchy,
    addBedToSurgeryDetails,
    storeDailyBedAllocation,
    getMonthlyBedAllocationReport,
    getAllAdmissionRecord
} from "../controllers/ward.js";

const wardRouter = express.Router();

wardRouter
    .route("/")
    .post(createWard)
    .get(getAllWards);

    wardRouter.get("/get-ward-ar", getAllAdmissionRecord);


wardRouter.get("/get-ward", getWardHierarchy);

wardRouter.patch("/handle-Bill/:id", addBedToSurgeryDetails);

wardRouter.get("/getOccipiedBeds", getOccupiedBedsWithPatientDetails);

wardRouter
    .route("/:wardId")
    .get(getWardById)
    .patch(updateWard)
    .delete(deleteWard);

wardRouter
    .route("/:wardId/allocate/:roomId/:bedIndex")
    .patch(allocatePatientToBed);

wardRouter
    .route("/:wardId/room/:roomId/bed/:bedIndex/clear")
    .patch(clearBed);

wardRouter
    .route("/:wardId/room/:roomId")
    .patch(updateBedInRoom)
    .delete(deleteRoomFromWard);

    wardRouter.post("/bed-allocation/store", storeDailyBedAllocation);
wardRouter.get("/bed-allocation/monthly", getMonthlyBedAllocationReport);


export default wardRouter;
