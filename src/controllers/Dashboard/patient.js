import { Types } from "mongoose";
import Patient from "../../models/patient.js";
import mongoose from "mongoose";
export const getPatientDashboard = async (req, res) => {
  try {
    const {
      branchName,
      patientName,
      UHID,
      patientType,
      page = 1,
      limit = 1000,
      organizationId,
    } = req.query;

    const matchFilter = {};

    if (branchName && Types.ObjectId.isValid(branchName)) {
      matchFilter.branch = Types.ObjectId(branchName);
    }

    if (patientName) {
      matchFilter.PatientName = { $regex: patientName, $options: "i" };
    }

    if (UHID) {
      matchFilter.UHID = { $regex: UHID, $options: "i" };
    }

    if (patientType) {
      matchFilter.patientType = patientType;
    }
    if (organizationId) {
      matchFilter.organizationId = mongoose.Types.ObjectId.isValid(organizationId)
        ? new mongoose.Types.ObjectId(organizationId)
        : organizationId;
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const chartData = await Patient.aggregate([
      {
        $group: {
          _id: "$branch",
          count: { $sum: 1 },
        },
      },
      {
        $lookup: {
          from: "branches",
          localField: "_id",
          foreignField: "_id",
          as: "branchInfo",
        },
      },
      {
        $unwind: "$branchInfo",
      },
      {
        $project: {
          _id: 0,
          branchName: "$branchInfo.branchName",
          count: 1,
        },
      },
      {
        $sort: { count: -1 },
      },
    ]);

    const patients = await Patient.find(matchFilter)
      .populate("branch")
     
      .skip(skip)
      .limit(parseInt(limit))
      .lean();







    const totalCount = await Patient.countDocuments(matchFilter);

    res.status(200).json({
      success: true,
      chartData,
      patients,
      pagination: {
        total: totalCount,
        page: parseInt(page),
        pages: Math.ceil(totalCount / limit),
      },
    });
  } catch (error) {
    console.error("Dashboard Error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};
