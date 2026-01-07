import mongoose from "mongoose";
import PharmacyProduct from "../../models/PharmacyProduct.js";
import PrescribeBilling from "../../models/prescribeBilling.js";
import Branch from "../../models/branch.js";
import XLSX from "xlsx";



export const getExpiryAlertDashboard = async (req, res) => {
  try {
    const {
      medicineName,
      branch,
      alertLevel,
      startDate,
      endDate,
      page = 1,
      limit = 1000,
      export: isExport,
      organizationId
    } = req.query;

    const match = {};
    if (medicineName) match.name = { $regex: medicineName, $options: "i" };
    if (branch && mongoose.Types.ObjectId.isValid(branch))
      match.branch = mongoose.Types.ObjectId(branch);
    if (organizationId) {
      match.organizationId = mongoose.Types.ObjectId.isValid(organizationId)
        ? new mongoose.Types.ObjectId(organizationId)
        : organizationId;
    }

    if (startDate && endDate)
      match.expiryDate = {
        $gte: new Date(startDate),
        $lte: new Date(endDate),
      };

    const productPipeline = [
      { $match: match },
      {
        $addFields: {
          daysToExpiry: {
            $floor: {
              $divide: [
                { $subtract: ["$expiryDate", "$$NOW"] },
                1000 * 60 * 60 * 24,
              ],
            },
          },
        },
      },
      {
        $addFields: {
          alertLevel: {
            $switch: {
              branches: [
                { case: { $lt: ["$daysToExpiry", 10] }, then: "High" },
                {
                  case: {
                    $and: [
                      { $gte: ["$daysToExpiry", 10] },
                      { $lte: ["$daysToExpiry", 20] },
                    ],
                  },
                  then: "Medium",
                },
              ],
              default: "Low",
            },
          },
        },
      },
      ...(alertLevel ? [{ $match: { alertLevel } }] : []),
      {
        $project: {
          _id: 1,
          medicineName: "$name",
          batchNo: 1,
          expiryDate: 1,
          stockLeft: "$stock",
          alertLevel: 1,
          daysToExpiry: 1,
        },
      },
    ];

    const products = await PharmacyProduct.aggregate(productPipeline);

    const summaries = await PrescribeBilling.aggregate([
      {
        $unwind: "$billDetails",
      },
      {
        $group: {
          _id: "$billDetails.medicineName",
          totalUnitsSold: { $sum: "$billDetails.quantity" },
          totalSalesAmount: { $sum: "$billDetails.totalAmount" },
        },
      },
    ]);

    const salesMap = new Map(summaries.map((s) => [s._id, s]));

    const merged = products.map((p) => {
      const stats = salesMap.get(p.medicineName) || {
        totalUnitsSold: 0,
        totalSalesAmount: 0,
      };
      return { ...p, ...stats };
    });

    merged.sort((a, b) => b.totalSalesAmount - a.totalSalesAmount);

    let rank = 0;
    merged.forEach((m, idx) => {
      if (idx === 0 || m.totalSalesAmount < merged[idx - 1].totalSalesAmount) {
        rank = idx + 1;
      }
      m.rank = rank;
    });

    // Export or Paginate
    if (isExport === "true") {
      const formatted = merged.map((r) => ({
        "Medicine Name": r.medicineName,
        "Batch Number": r.batchNo,
        "Expiry Date": r.expiryDate.toISOString().split("T")[0],
        "Stock Left": r.stockLeft,
        "Alert Level": r.alertLevel,
        "Days to Expiry": r.daysToExpiry,
        "Units Sold": r.totalUnitsSold,
        "Sales Amount": r.totalSalesAmount,
        "Sales Rank": r.rank,
      }));

      const ws = XLSX.utils.json_to_sheet(formatted);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Expiry + Sales Dashboard");
      const buffer = XLSX.write(wb, { bookType: "xlsx", type: "buffer" });

      res.setHeader("Content-Disposition", "attachment; filename=expiry-sales-dashboard.xlsx");
      res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
      return res.send(buffer);
    }

    const pageNum = Number(page),
      pageSize = Number(limit),
      start = (pageNum - 1) * pageSize,
      paginated = merged.slice(start, start + pageSize);

    res.json({
      success: true,
      data: paginated,
      filters: {
        branches: await Branch.find({}, "_id branchName").lean(),
        alertLevels: ["High", "Medium", "Low"],
      },
      pagination: {
        page: pageNum,
        limit: pageSize,
        total: merged.length,
        totalPages: Math.ceil(merged.length / pageSize),
      },
    });
  } catch (err) {
    console.error("Expiry + Sales Dashboard Error:", err);
    res.status(500).json({ message: err.message });
  }
};
