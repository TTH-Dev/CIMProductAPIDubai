import PrescribeBilling from "../../models/prescribeBilling.js";
import Branch from "../../models/branch.js";
import XLSX from "xlsx";
import mongoose from "mongoose";

export const getRevenueByBranchDashboard = async (req, res) => {
  try {
    const { category, branchId, startDate, endDate, export: isExport, organizationId, page = 1,
      limit = 1000, } = req.query;

    const match = {};
    if (category) match.prescriptionFor = category;
    if (branchId && mongoose.Types.ObjectId.isValid(branchId)) {
      match.branch = new mongoose.Types.ObjectId(branchId);
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
      {
        $group: {
          _id: {
            branch: "$branch",
            service: "$prescriptionFor",
          },
          totalAmount: { $sum: "$total" },
          patientCount: { $sum: 1 },
        },
      },
      {
        $lookup: {
          from: "branches",
          localField: "_id.branch",
          foreignField: "_id",
          as: "branchInfo",
        },
      },
      { $unwind: "$branchInfo" },
      {
        $project: {
          branchName: "$branchInfo.branchName",
          serviceName: "$_id.service",
          totalAmount: 1,
          patientCount: 1,
        },
      },
    ];

    const data = await PrescribeBilling.aggregate(pipeline);

    const rankedData = [...data].sort((a, b) => b.totalAmount - a.totalAmount);
    const pageNumber = Number(page);
    const pageSize = Number(limit);
    const startIndex = (pageNumber - 1) * pageSize;
    const paginatedData = rankedData.slice(startIndex, startIndex + pageSize);

    rankedData.forEach((entry, idx) => {
      entry.rank = `${idx + 1} ${["st", "nd", "rd"][idx] || "th"}`;
    });

    const totalRevenue = rankedData.reduce((sum, d) => sum + d.totalAmount, 0);

    if (isExport === "true") {
      const formatted = rankedData.map((r) => ({
        "Branch Name": r.branchName,
        "Service Name": r.serviceName,
        "Patient Count": r.patientCount,
        "Total Amount": r.totalAmount,
        "Rank": r.rank,
      }));

      const ws = XLSX.utils.json_to_sheet(formatted);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Revenue By Branch");
      const buffer = XLSX.write(wb, { bookType: "xlsx", type: "buffer" });

      res.setHeader("Content-Disposition", "attachment; filename=revenue-by-branch.xlsx");
      res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
      return res.send(buffer);
    }

    res.json({
      success: true,
      totalRevenue,
      data: paginatedData,
      pagination: {
        page: pageNumber,
        limit: pageSize,
        total: rankedData.length,
        totalPages: Math.ceil(rankedData.length / pageSize),
      },
      filters: {
        branches: await Branch.find({}, "_id branchName").lean(),
        categories: ["op", "ip", "pharmacy", "lab", "consultation"],
      },
    });

  } catch (err) {
    console.error("Revenue Dashboard Error:", err);
    res.status(500).json({ message: err.message });
  }
};
