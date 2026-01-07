import Billing from "../../models/billing.js";
import XLSX from "xlsx";

const getAggregationPipeline = (match) => [
  { $match: match },
  { $unwind: "$billDetails" },
  {
    $group: {
      _id: "$billDetails.serviceName",
      costPrice: {
        $sum: {
          $multiply: ["$billDetails.unitPrice", "$billDetails.quantity"],
        },
      },
      patientCount: { $sum: "$billDetails.quantity" },
      revenueGenerated: { $sum: "$billDetails.totalAmount" },
      profitMargin: {
        $avg: {
          $cond: [
            { $gt: ["$billDetails.totalAmount", 0] },
            {
              $multiply: [
                {
                  $divide: [
                    {
                      $subtract: [
                        "$billDetails.totalAmount",
                        {
                          $multiply: [
                            "$billDetails.unitPrice",
                            "$billDetails.quantity",
                          ],
                        },
                      ],
                    },
                    "$billDetails.totalAmount",
                  ],
                },
                100,
              ],
            },
            0,
          ],
        },
      },
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
  { $unwind: { path: "$branchInfo", preserveNullAndEmptyArrays: true } },
  {
    $project: {
      serviceName: "$_id",
      costPrice: { $round: ["$costPrice", 2] },
      patientCount: 1,
      revenueGenerated: { $round: ["$revenueGenerated", 2] },
      profitMargin: { $round: ["$profitMargin", 2] },
    },
  },
  { $sort: { revenueGenerated: -1 } },
];

export const getCostAnalysis = async (req, res) => {
  try {
    const {
      branch,
      serviceCategory,
      startDate,
      endDate,
      page = 1,
      limit = 1000,
      export: isExport,
      organizationId
    } = req.query;

    const match = {};
    if (branch) match.branch = branch;
    if (serviceCategory) match["billDetails.categories"] = serviceCategory;
    if (startDate && endDate)
      match.createdAt = {
        $gte: new Date(startDate),
        $lte: new Date(endDate),
      };
    if (organizationId) {
      match.organizationId = mongoose.Types.ObjectId.isValid(organizationId)
        ? new mongoose.Types.ObjectId(organizationId)
        : organizationId;
    }
    const chartDataRaw = await Billing.aggregate([
      { $match: match },
      {
        $group: {
          _id: {
            month: { $month: "$createdAt" },
            year: { $year: "$createdAt" },
          },
          revenue: { $sum: "$total" },
          cost: { $sum: "$subTotal" },
        },
      },
      { $sort: { "_id.year": 1, "_id.month": 1 } },
    ]);

    const chartData = chartDataRaw.map((item) => ({
      month: item._id.month,
      year: item._id.year,
      revenue: item.revenue,
      cost: item.cost,
    }));

    const aggPipeline = getAggregationPipeline(match);

    if (isExport === "true") {
      // FULL export — no pagination
      const records = await Billing.aggregate(aggPipeline);
      const formatted = records.map((r) => ({
        "Service Name": r.serviceName,
        "Cost Price": r.costPrice,
        "Patient Count": r.patientCount,
        "Revenue Generated": r.revenueGenerated,
        "Profit Margin (%)": r.profitMargin,
      }));

      const ws = XLSX.utils.json_to_sheet(formatted);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Cost Analysis");

      const buffer = XLSX.write(wb, { bookType: "xlsx", type: "buffer" });

      res.setHeader("Content-Disposition", "attachment; filename=cost-analysis.xlsx");
      res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
      return res.send(buffer);
    }

    // Paginated result
    const pageNum = Number(page);
    const pageSize = Number(limit);
    const skip = (pageNum - 1) * pageSize;

    const totalResults = await Billing.aggregate([...aggPipeline, { $count: "total" }]);
    const total = totalResults[0]?.total || 0;
    const totalPages = Math.ceil(total / pageSize);

    const costDetails = await Billing.aggregate([
      ...aggPipeline,
      { $skip: skip },
      { $limit: pageSize },
    ]);

    const serviceCategories = await Billing.distinct("billDetails.categories");
    const branches = await Billing.distinct("branch");

    res.json({
      success: true,
      chartData,
      costDetails,
      serviceCategories,
      branches,
      pagination: {
        page: pageNum,
        limit: pageSize,
        total,
        totalPages,
      },
    });
  } catch (err) {
    console.error("Cost Analysis Error:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};
