import mongoose from "mongoose";
import Billing from "../../models/billing.js";
import XLSX from "xlsx";

export const getRevenueDashboard = async (req, res) => {
  try {
    const {
      doctorName,
      branch,
      startDate,
      endDate,
      page = 1,
      limit = 1000,
      export: exportData,
      organizationId,
    } = req.query;

    const matchFilter = {};
    if (branch && mongoose.Types.ObjectId.isValid(branch)) {
      matchFilter.branch = mongoose.Types.ObjectId(branch);
    }
    if (startDate || endDate) {
      matchFilter.paymentDate = {};
      if (startDate) matchFilter.paymentDate.$gte = new Date(startDate);
      if (endDate) matchFilter.paymentDate.$lte = new Date(endDate);
    }
    if (organizationId) {
      matchFilter.organizationId = mongoose.Types.ObjectId.isValid(organizationId)
        ? new mongoose.Types.ObjectId(organizationId)
        : organizationId;
    }

    const pipeline = [
      { $match: matchFilter },

      {
        $lookup: {
          from: "patients",
          localField: "patientId",
          foreignField: "_id",
          as: "patient",
        },
      },
      { $unwind: { path: "$patient", preserveNullAndEmptyArrays: true } },

      {
        $lookup: {
          from: "doctors",
          localField: "patient.doctorId",
          foreignField: "_id",
          as: "doctorInfo",
        },
      },
      {
        $unwind: {
          path: "$doctorInfo",
          preserveNullAndEmptyArrays: true,
        },
      },

      {
        $addFields: {
          doctorName: "$doctorInfo.doctorName",
        },
      },

      ...(doctorName
        ? [
            {
              $match: {
                doctorName: { $regex: doctorName, $options: "i" },
              },
            },
          ]
        : []),

      {
        $group: {
          _id: {
            branch: "$branch",
            doctor: "$doctorName",
          },
          patientCount: { $sum: 1 },
          totalAmount: { $sum: "$total" },
        },
      },

      { $sort: { totalAmount: -1 } },

      {
        $setWindowFields: {
          sortBy: { totalAmount: -1 },
          output: {
            rank: { $rank: {} },
          },
        },
      },

      {
        $lookup: {
          from: "branches",
          localField: "_id.branch",
          foreignField: "_id",
          as: "branchDetails",
        },
      },

      {
        $project: {
          branch: { $arrayElemAt: ["$branchDetails.branchName", 0] },
          doctorName: "$_id.doctor",
          patientCount: 1,
          totalAmount: 1,
          rank: 1,
        },
      },

      { $sort: { totalAmount: -1 } },
    ];

    if (exportData === "true") {
      const records = await Billing.aggregate(pipeline);
      const formatted = records.map((r) => ({
        Branch: r.branch || "Unknown",
        Doctor: r.doctorName || "Unknown",
        PatientCount: r.patientCount,
        TotalAmount: r.totalAmount,
        Rank: r.rank,
      }));

      const ws = XLSX.utils.json_to_sheet(formatted);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Revenue Dashboard");

      const buf = XLSX.write(wb, { type: "buffer", bookType: "xlsx" });
      res.setHeader(
        "Content-Disposition",
        "attachment; filename=revenue-dashboard.xlsx"
      );
      res.setHeader(
        "Content-Type",
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
      );
      return res.send(buf);
    }

    const skip = (Number(page) - 1) * Number(limit);
    const countResults = await Billing.aggregate([...pipeline, { $count: "total" }]);
    const total = countResults[0]?.total || 0;
    const totalPages = Math.ceil(total / limit);

    pipeline.push({ $skip: skip }, { $limit: Number(limit) });
    const data = await Billing.aggregate(pipeline);

    const yearFilter = [
      { $match: matchFilter },
      {
        $group: {
          _id: { month: { $month: "$paymentDate" } },
          revenue: { $sum: "$total" },
        },
      },
      { $sort: { "_id.month": 1 } },
    ];
    const monthlyAgg = await Billing.aggregate(yearFilter);
    const chartData = monthlyAgg.map((d) => ({
      month: d._id.month,
      revenue: d.revenue,
    }));

    res.json({
      success: true,
      chartData,
      data,
      page: Number(page),
      limit: Number(limit),
      total,
      totalPages,
    });
  } catch (err) {
    console.error("Revenue Dashboard Error:", err);
    res.status(500).json({ success: false, message: err.message });
  }
};
