import mongoose from "mongoose";
import PrescribeBilling from "../../models/prescribeBilling.js";
import Branch from "../../models/branch.js";
import Doctor from "../../models/Doctor.js";
import XLSX from "xlsx";

export const getMedicineDashboard = async (req, res) => {
  try {
    const {
      medicineName,
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
    if (branch && mongoose.Types.ObjectId.isValid(branch)) {
      match.branch = mongoose.Types.ObjectId(branch);
    }
    if (consultDoctor && mongoose.Types.ObjectId.isValid(consultDoctor)) {
      match.doctorId = mongoose.Types.ObjectId(consultDoctor);
    }
    if (startDate && endDate) {
      match.paymentDate = {
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
      { $unwind: "$billDetails" },
      ...(medicineName
        ? [{ $match: { "billDetails.medicineName": new RegExp(medicineName, "i") } }]
        : []),
      {
        $group: {
          _id: "$billDetails.medicineName",
          totalUnits: { $sum: "$billDetails.quantity" },
          totalCost: { $sum: "$billDetails.totalAmount" }
        }
      },
      {
        $setWindowFields: {
          sortBy: { totalCost: -1 },
          output: { rank: { $rank: {} } }
        }
      },
      { $sort: { totalCost: -1 } },
      {
        $project: {
          medicineName: "$_id",
          totalUnits: 1,
          totalCost: 1,
          rank: 1
        }
      }
    ];

    if (isExport === "true") {
      const data = await PrescribeBilling.aggregate(pipeline);
      const formatted = data.map(d => ({
        "Medicine Name": d.medicineName,
        "Total Units Sold": d.totalUnits,
        "Total Cost": d.totalCost,
        "Rank": d.rank
      }));

      const ws = XLSX.utils.json_to_sheet(formatted);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Medicine Dashboard");
      const buffer = XLSX.write(wb, { bookType: "xlsx", type: "buffer" });

      res.setHeader("Content-Disposition", "attachment; filename=medicine-dashboard.xlsx");
      res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
      return res.send(buffer);
    }

    const pageNum = Number(page);
    const pageSize = Number(limit);
    const skip = (pageNum - 1) * pageSize;

    const totalArr = await PrescribeBilling.aggregate([...pipeline, { $count: "total" }]);
    const total = totalArr[0]?.total || 0;
    const totalPages = Math.ceil(total / pageSize);

    const data = await PrescribeBilling.aggregate([
      ...pipeline,
      { $skip: skip },
      { $limit: pageSize }
    ]);

    const branches = await Branch.find({}, "_id branchName").lean();
    const doctors = await Doctor.find({}, "_id doctorName").lean();

    res.json({
      success: true,
      data,
      filters: { branches, doctors },
      pagination: { page: pageNum, limit: pageSize, total, totalPages }
    });

  } catch (err) {
    console.error("Medicine Dashboard Error:", err);
    res.status(500).json({ error: err.message });
  }
};
