import Ward from "../models/ward.js";
import catchAsync from "../utils/catchAsync.js";
import AppError from "../utils/AppError.js";
import APIFeatures from "../utils/ApiFeatures.js";
import Patient from "../models/patient.js";
import SurgeryDetails from "../models/surgeryDetails.js";
import dayjs from "dayjs";
import { BedAllocationReport } from "../models/ward.js";
import { AdmissionRecord } from "../models/patient.js";

export const createWard = catchAsync(async (req, res, next) => {
    const { floor, wardType, room, amount } = req.body;

    if (!room || typeof room !== 'object') {
        return next(new AppError("Room data must be a single object", 400));
    }

    const beds = Array.from({ length: room.noOfBed }, () => ({
        occupied: false,
        patientId: null,
        inTime: null,
        outTime: null
    }));

    const ward = await Ward.create({
        floor,
        wardType,
        amount,
        room: [{
            roomNo: room.roomNo,
            noOfBed: room.noOfBed,
            beds
        }]
    });

    res.status(201).json({
        status: "Success",
        data: { ward }
    });
});

export const getAllWards = catchAsync(async (req, res, next) => {
    const limit = parseInt(req.query.limit) || 10;
    const page = parseInt(req.query.page) || 1;

    const features = new APIFeatures(Ward.find().populate("room.beds.patientId"), req.query)
        .filter()
        .sort()
        .limitFields()
        .paginate();

    const wards = await features.query;
    const totalRecords = await Ward.countDocuments(features.filterQuery || {});
    const totalPages = Math.ceil(totalRecords / limit);

    res.status(200).json({
        status: "Success",
        totalPages,
        currentPage: page,
        results: wards.length,
        data: { wards },
    });
});


export const getAllAdmissionRecord = catchAsync(async (req, res, next) => {
    const limit = parseInt(req.query.limit) || 10;
    const page = parseInt(req.query.page) || 1;

    const features = new APIFeatures(AdmissionRecord.find(), req.query)
        .sort()
        .limitFields()
        .paginate();

    const admissionRecord = await features.query;
    const totalRecords = await AdmissionRecord.countDocuments();
    const totalPages = Math.ceil(totalRecords / limit);

    res.status(200).json({
        status: "Success",
        totalPages,
        currentPage: page,
        results: admissionRecord.length,
        data: { admissionRecord },
    });
});
export const getWardById = catchAsync(async (req, res, next) => {
    const { wardId } = req.params;

    const ward = await Ward.findById(wardId);
    if (!ward) {
        return next(new AppError("Ward not found", 404));
    }

    res.status(200).json({
        status: "Success",
        data: { ward },
    });
});

export const clearBed = catchAsync(async (req, res, next) => {
    const { wardId, roomId, bedIndex } = req.params;
    const { outTime, patientId } = req.body;

    const ward = await Ward.findById(wardId);
    if (!ward) return next(new AppError("Ward not found", 404));

    const room = ward.room.id(roomId);
    if (!room) return next(new AppError("Room not found", 404));

    const bed = room.beds[bedIndex];
    if (!bed) return next(new AppError("Bed not found", 404));

    bed.occupied = false;
    bed.patientId = null;
    bed.inTime = null;
    bed.outTime = outTime;

    const patientData = await Patient.findById(patientId);

    const arData = {
        patientId: patientId,
        patientName: patientData.PatientName,
        opNo: patientData.opNo,
        admittedDate: patientData.admittedDate,
        dischargeDate: Date.now(),
        roomNo: patientData.bedManagement.bed.bedNo
    }

    const ar = await AdmissionRecord.create(arData);

    const data = {
        wardId: null,
        roomId: null,
        bed: null,
        wardType: null
    };
    const patient = await Patient.findByIdAndUpdate(
        patientId,
        { bedManagement: data }
    );

    await ward.save();

    res.status(200).json({
        status: "Success",
        message: `Bed ${bedIndex} cleared`,
        data: { ward }
    });
});

export const allocatePatientToBed = catchAsync(async (req, res, next) => {
    const { wardId, roomId, bedIndex } = req.params;
    const { patientId, inTime } = req.body;

    if (!patientId) {
        return next(new AppError("Patient ID is required", 400));
    }

    const ward = await Ward.findById(wardId);
    if (!ward) return next(new AppError("Ward not found", 404));

    const room = ward.room.id(roomId);
    if (!room) return next(new AppError("Room not found", 404));

    const bed = room.beds[bedIndex];
    if (!bed) return next(new AppError("Bed not found", 404));

    if (bed.occupied) return next(new AppError("Bed is already occupied", 400));

    bed.occupied = true;
    bed.patientId = patientId;
    bed.inTime = inTime;
    bed.allocatedTime = new Date();
    bed.bedno = bedIndex;

    await ward.save();

    const data = {
        wardId: ward._id,
        roomId: roomId,
        bed: bed,
        wardType: ward.wardType
    };


    const patient = await Patient.findByIdAndUpdate(
        patientId,
        { bedManagement: data,admittedDate:Date.now() }
    );

    const today = dayjs().startOf("day").toDate();
    const endOfDay = dayjs().endOf("day").toDate();

    let totalBeds = 0;
    let allocatedBeds = 0;

    const allWards = await Ward.find();

    allWards.forEach(w => {
        w.room.forEach(r => {
            r.beds.forEach(b => {
                totalBeds++;
                if (
                    b.occupied &&
                    b.allocatedTime &&
                    b.allocatedTime >= today &&
                    b.allocatedTime <= endOfDay
                ) {
                    allocatedBeds++;
                }
            });
        });
    });

    const allocationPercentage = totalBeds === 0 ? "0%" : ((allocatedBeds / totalBeds) * 100).toFixed(2) + "%";

    await BedAllocationReport.findOneAndUpdate(
        { date: today },
        {
            date: today,
            totalBeds,
            allocatedBeds,
            allocationPercentage
        },
        { upsert: true, new: true }
    );

    res.status(200).json({
        status: "Success",
        message: `Patient allocated to bed ${bedIndex} in room ${room.roomNo}`,
        data: { ward, patient }
    });
});

export const updateBedInRoom = catchAsync(async (req, res, next) => {
    const { wardId, roomId, bedIndex } = req.params;

    const ward = await Ward.findById(wardId);
    if (!ward) return next(new AppError("Ward not found", 404));

    const room = ward.room.id(roomId);
    if (!room) return next(new AppError("Room not found", 404));

    const bed = room.beds[bedIndex];
    if (!bed) return next(new AppError("Bed not found", 404));

    Object.assign(bed, req.body);

    await ward.save();

    res.status(200).json({
        status: "Success",
        message: `Bed ${bedIndex} updated`,
        data: { ward }
    });
});

export const updateWard = catchAsync(async (req, res, next) => {
    const { wardId } = req.params;
    const { numberOfBeds } = req.body;

    let ward = await Ward.findById(wardId);

    if (!ward) {
        return next(new AppError("Ward not found", 404));
    }

    if (numberOfBeds !== undefined && numberOfBeds !== ward.beds.length) {
        const currentLength = ward.beds.length;

        if (numberOfBeds > currentLength) {
            const newBeds = [];
            for (let i = currentLength + 1; i <= numberOfBeds; i++) {
                newBeds.push({
                    bedNumber: `Bed-${i}`,
                    patientId: null
                });
            }
            ward.beds = [...ward.beds, ...newBeds];
        } else if (numberOfBeds < currentLength) {
            ward.beds = ward.beds.slice(0, numberOfBeds);
        }
    }

    Object.keys(req.body).forEach((key) => {
        if (key !== "beds" && key !== "numberOfBeds") {
            ward[key] = req.body[key];
        }
    });

    await ward.save();

    res.status(200).json({
        status: "Success",
        data: { updatedWard: ward },
    });
});


export const deleteWard = catchAsync(async (req, res, next) => {
    const { wardId } = req.params;

    const deletedWard = await Ward.findByIdAndDelete(wardId);

    if (!deletedWard) {
        return next(new AppError("Ward not found", 404));
    }

    res.status(204).json({
        status: "Success",
        data: null,
    });
});

export const deleteRoomFromWard = catchAsync(async (req, res, next) => {
    const { wardId, roomId } = req.params;

    const ward = await Ward.findByIdAndUpdate(
        wardId,
        { $pull: { room: { _id: roomId } } },
        { new: true }
    );

    if (!ward) {
        return next(new AppError("Ward or Room not found", 404));
    }

    res.status(200).json({
        status: "Success",
        message: "Room removed from ward",
        data: { ward },
    });
});

export const getOccupiedBedsWithPatientDetails = catchAsync(async (req, res, next) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const data = await Ward.aggregate([
        { $unwind: "$room" },
        { $unwind: "$room.beds" },
        { $match: { "room.beds.occupied": true } },
        {
            $lookup: {
                from: "patients",
                localField: "room.beds.patientId",
                foreignField: "_id",
                as: "patientInfo"
            }
        },
        { $unwind: "$patientInfo" },
        {
            $project: {
                floor: 1,
                wardType: 1,
                room: 1,
                roomNo: "$room.roomNo",
                admittedDate: "$room.beds.allocatedTime",
                opNo: "$patientInfo.opNo",
                patientName: "$patientInfo.PatientName",
                patientId: "$patientInfo._id",
                roomId: "$room._id",
                benIndex: "$room.bed"
            }
        },
        { $skip: skip },
        { $limit: limit }
    ]);

    // Count total (for total pages)
    const totalCountAggregation = await Ward.aggregate([
        { $unwind: "$room" },
        { $unwind: "$room.beds" },
        { $match: { "room.beds.occupied": true } },
        { $count: "total" }
    ]);

    const totalCount = totalCountAggregation[0]?.total || 0;
    const totalPages = Math.ceil(totalCount / limit);

    res.status(200).json({
        status: "Success",
        totalCount,
        totalPages,
        currentPage: page,
        result: data.length,
        data
    });
});

export const getWardHierarchy = catchAsync(async (req, res) => {
    const { floor, wardType, roomNo } = req.query;

    if (floor && !wardType && !roomNo) {
        const wardTypes = await Ward.find({ floor }).distinct("wardType");
        return res.status(200).json({ floor, wardTypes });
    }

    if (floor && wardType && !roomNo) {
        const wards = await Ward.find({ floor, wardType }).lean();

        const rooms = wards.flatMap(ward =>
            ward.room.map(r => ({
                roomNo: r.roomNo,
                noOfBed: r.noOfBed
            }))
        );

        return res.status(200).json({ floor, wardType, rooms });
    }

    if (floor && wardType && roomNo) {
        const ward = await Ward.findOne({ floor, wardType }).lean();

        if (!ward) return res.status(404).json({ message: "Ward not found" });

        const roomIndex = ward.room.findIndex(r => r.roomNo == roomNo);
        const room = ward.room[roomIndex];

        if (!room) return res.status(404).json({ message: "Room not found" });

        const beds = room.beds.map((bed, index) => ({
            bedNo: index,
            occupied: bed.occupied,
            patientId: bed.patientId,
            inTime: bed.inTime,
            outTime: bed.outTime,
            allocatedTime: bed.allocatedTime
        }));

        return res.status(200).json({
            floor,
            wardType,
            amount: ward.amount,
            roomNo,
            wardId: ward._id,
            roomId: room._id,
            roomIndex,
            beds
        });
    }

    return res.status(400).json({ message: "Insufficient query parameters" });
});

export const addBedToSurgeryDetails = catchAsync(async (req, res) => {
    const { id } = req.params;
    const bedData = req.body;

    const patient = await Patient.findById(id).lean();

    if (!patient || !patient.surgeryDetailsId) {
        return res.status(404).json({ message: "Patient or surgeryDetails not found" });
    }

    const surgeryMgmtId = patient.surgeryDetailsId;

    const surgeryMgmt = await SurgeryDetails.findById(surgeryMgmtId);

    if (!surgeryMgmt) {
        return res.status(404).json({ message: "SurgeryManagement not found" });
    }

    const bedExists = surgeryMgmt.surgeryDetails.some(
        detail => detail.surgeryType === "Bed"
    );

    if (bedExists) {
        return res.status(400).json({ message: "Bed already added" });
    }

    const data = {
        surgeryName: "Bed",
        surgeryType: "Bed",
        categories: bedData?.wardType,
        amount: bedData?.amount
    };

    surgeryMgmt.surgeryDetails.push(data);

    const totalAmount = surgeryMgmt.surgeryDetails.reduce((sum, detail) => sum + (detail.amount || 0), 0);
    surgeryMgmt.total = totalAmount;
    surgeryMgmt.subTotal = totalAmount;

    await surgeryMgmt.save();

    res.status(200).json({ message: "Bed added successfully", data: surgeryMgmt });
});


export const storeDailyBedAllocation = catchAsync(async (req, res, next) => {
    const date = dayjs().startOf("day").toDate();
    const endOfDay = dayjs().endOf("day").toDate();

    let totalBeds = 0;
    let allocatedBedsToday = 0;

    const wards = await Ward.find();

    wards.forEach(ward => {
        ward.room.forEach(room => {
            room.beds.forEach(bed => {
                totalBeds++;
                if (
                    bed.occupied &&
                    bed.allocatedTime &&
                    bed.allocatedTime >= date &&
                    bed.allocatedTime <= endOfDay
                ) {
                    allocatedBedsToday++;
                }
            });
        });
    });

    const allocationPercentage = totalBeds === 0 ? 0 : ((allocatedBedsToday / totalBeds) * 100).toFixed(2);

    // Upsert report (avoid duplicates)
    await BedAllocationReport.findOneAndUpdate(
        { date },
        {
            date,
            totalBeds,
            allocatedBeds: allocatedBedsToday,
            allocationPercentage: `${allocationPercentage}%`
        },
        { upsert: true, new: true }
    );

    res.status(200).json({
        status: "success",
        message: "Daily bed allocation report stored successfully",
        date: dayjs(date).format("YYYY-MM-DD"),
        totalBeds,
        allocatedBedsToday,
        allocationPercentage: `${allocationPercentage}%`
    });
});

export const getMonthlyBedAllocationReport = catchAsync(async (req, res, next) => {
    const { month, year } = req.query;

    if (!month || !year) {
        return res.status(400).json({ error: "Please provide month and year" });
    }

    const start = dayjs(`${year}-${month}-01`).startOf("month").toDate();
    const end = dayjs(start).endOf("month").toDate();

    const reports = await BedAllocationReport.find({
        date: { $gte: start, $lte: end }
    }).sort({ date: 1 });

    res.status(200).json({
        status: "success",
        month,
        year,
        totalDays: reports.length,
        reports
    });
});