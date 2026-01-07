import mongoose from "mongoose";
import Test from "../../models/test.js";
import Branch from "../../models/branch.js";
import XLSX from "xlsx";
import { loadModel } from "../../utils/loadModel.js";

export const getTestDashboard = async (req, res) => {
  try {
    const Doctor = await loadModel("Doctor", "../../models/doctor.js"); 
    const {
      testName,
      branch,
      consultDoctor,
      startDate,
      endDate,
      page = 1,
      limit = 1000,
      export: isExport,
      organizationId
    } = req.query;

    const match = {};
    if (testName) match.testName = { $regex: testName, $options: "i" };
    if (branch && mongoose.Types.ObjectId.isValid(branch)) {
      match.branch = new mongoose.Types.ObjectId(branch);
    }
    if (consultDoctor && mongoose.Types.ObjectId.isValid(consultDoctor)) {
      match.doctorId = new mongoose.Types.ObjectId(consultDoctor);
    }
    if (startDate && endDate) {
      match.createdAt = {
        $gte: new Date(startDate),
        $lte: new Date(endDate),
      };
    }
    if (organizationId) {
      match.organizationId = mongoose.Types.ObjectId.isValid(organizationId)
        ? new mongoose.Types.ObjectId(organizationId)
        : organizationId;
    }
    const pipeline = [
      { $match: match },
      {
        $project: {
          testName: 1,
          branch: 1,
          doctorId: 1,
          count: "$quantityUsage",
          totalAmount: { $multiply: ["$price", "$quantityUsage"] },
          createdAt: 1,
        },
      },
      {
        $setWindowFields: {
          sortBy: { totalAmount: -1 },
          output: { rank: { $rank: {} } },
        },
      },
      {
        $lookup: {
          from: "branches",
          localField: "branch",
          foreignField: "_id",
          as: "branchInfo",
        },
      },
      { $unwind: { path: "$branchInfo", preserveNullAndEmptyArrays: true } },
      {
        $lookup: {
          from: "doctors",
          localField: "doctorId",
          foreignField: "_id",
          as: "doctorInfo",
        },
      },
      { $unwind: { path: "$doctorInfo", preserveNullAndEmptyArrays: true } },
      {
        $project: {
          testName: 1,
          branch: "$branchInfo.branchName",
          count: 1,
          totalAmount: 1,
          rank: 1,
          consultDoctor: "$doctorInfo.doctorName",
        },
      },
      { $sort: { totalAmount: -1 } },
    ];

    if (isExport === "true") {
      const records = await Test.aggregate(pipeline);
      const formatted = records.map((r) => ({
        "Test Name": r.testName,
        Branch: r.branch,
        Count: r.count,
        "Total Amount": r.totalAmount,
        Rank: r.rank,
        "Consult Doctor": r.consultDoctor,
      }));

      const ws = XLSX.utils.json_to_sheet(formatted);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Test Dashboard");
      const buffer = XLSX.write(wb, { bookType: "xlsx", type: "buffer" });

      res.setHeader("Content-Disposition", "attachment; filename=test-dashboard.xlsx");
      res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
      return res.send(buffer);
    }

    const pageNum = Number(page);
    const pageSize = Number(limit);
    const skip = (pageNum - 1) * pageSize;

    const totalResultsArr = await Test.aggregate([...pipeline, { $count: "total" }]);
    const total = totalResultsArr[0]?.total || 0;
    const totalPages = Math.ceil(total / pageSize);

    const tableData = await Test.aggregate([
      ...pipeline,
      { $skip: skip },
      { $limit: pageSize },
    ]);

    const testNamesList = await Test.distinct("testName");
    const branchesList = await Branch.find({}, "_id branchName").lean();
    const doctorsList = await Doctor.find({}, "_id doctorName").lean();

    res.json({
      success: true,
      tableData,
      filters: {
        testNames: testNamesList,
        branches: branchesList,
        consultDoctors: doctorsList,
      },
      pagination: {
        page: pageNum,
        limit: pageSize,
        total,
        totalPages,
      },
    });
  } catch (err) {
    console.error("Test Dashboard Error:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};
