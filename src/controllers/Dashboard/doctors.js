import mongoose from "mongoose";
import Doctor from "../../models/Doctor.js";
import XLSX from "xlsx"; 

export const getDoctorDashboard = async (req, res) => {
  try {
    const {
      doctorName,
      branch,
      visitType,
      startDate,
      endDate,
      page = 1,
      limit = 1000,
      export: exportData,
      organizationId
    } = req.query;

    const doctorMatch = {};
    if (doctorName) {
      doctorMatch.doctorName = { $regex: doctorName, $options: "i" };
    }
    if (branch) {
      doctorMatch.branch = new mongoose.Types.ObjectId(branch);
    }
 if (organizationId) {
      doctorMatch.organizationId = organizationId;
    }
    const visitedDoctorMatch = [];

    if (visitType) {
      visitedDoctorMatch.push({ "visitedDoctors.visitType": visitType });
    }

    if (startDate || endDate) {
      const dateRange = {};
      if (startDate) dateRange.$gte = new Date(startDate);
      if (endDate) dateRange.$lte = new Date(endDate);
      visitedDoctorMatch.push({ "visitedDoctors.visitedDate": dateRange });
    }

    const pipeline = [
  { $match: doctorMatch },

  {
    $lookup: {
      from: "patients",
      let: { doctorId: "$_id" },
      pipeline: [
        {
          $match: {
            $expr: {
              $in: ["$$doctorId", "$visitedDoctors.doctorId"],
            },
          },
        },
        ...(visitedDoctorMatch.length > 0
          ? [
              {
                $match: {
                  $expr: {
                    $gt: [
                      {
                        $size: {
                          $filter: {
                            input: "$visitedDoctors",
                            as: "vd",
                            cond: {
                              $and: [
                                { $eq: ["$$vd.doctorId", "$$doctorId"] },
                                ...(visitType
                                  ? [
                                      {
                                        $eq: ["$$vd.visitType", visitType],
                                      },
                                    ]
                                  : []),
                                ...(startDate || endDate
                                  ? [
                                      {
                                        $and: [
                                          ...(startDate
                                            ? [
                                                {
                                                  $gte: [
                                                    "$$vd.visitedDate",
                                                    new Date(startDate),
                                                  ],
                                                },
                                              ]
                                            : []),
                                          ...(endDate
                                            ? [
                                                {
                                                  $lte: [
                                                    "$$vd.visitedDate",
                                                    new Date(endDate),
                                                  ],
                                                },
                                              ]
                                            : []),
                                        ],
                                      },
                                    ]
                                  : []),
                              ],
                            },
                          },
                        },
                      },
                      0,
                    ],
                  },
                },
              },
            ]
          : []),
      ],
      as: "matchedPatients",
    },
  },

  {
    $addFields: {
      totalPatients: { $size: "$matchedPatients" },
    },
  },

  ...(visitedDoctorMatch.length > 0
    ? [
        {
          $match: {
            totalPatients: { $gt: 0 },
          },
        },
      ]
    : []),

  {
    $lookup: {
      from: "branches",
      localField: "branch",
      foreignField: "_id",
      as: "branchInfo",
    },
  },
  { $unwind: { path: "$branchInfo", preserveNullAndEmptyArrays: true } },

  // Sort by totalPatients desc
  { $sort: { totalPatients: -1 } },

  // Add rank field
  {
    $setWindowFields: {
      sortBy: { totalPatients: -1 },
      output: {
        rank: { $rank: {} },
      },
    },
  },

  {
    $project: {
      doctorName: 1,
      branch: 1,
      branchName: "$branchInfo.branchName",
      totalPatients: 1,
      rank: 1,
    },
  },
];


    if (exportData === "true") {
      const exportResults = await Doctor.aggregate(pipeline);

      const exportFormatted = exportResults.map((doc) => ({
        Doctor: doc.doctorName,
        Branch: doc.branch?.toString() ?? "N/A",
        PatientsAttended: doc.totalPatients,
        Rank: doc.rank,
      }));

      const worksheet = XLSX.utils.json_to_sheet(exportFormatted);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "Doctor Dashboard");

      const buffer = XLSX.write(workbook, {
        type: "buffer",
        bookType: "xlsx",
      });

      res.setHeader("Content-Disposition", "attachment; filename=doctor-dashboard.xlsx");
      res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
      return res.send(buffer);
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    pipeline.push({ $skip: skip });
    pipeline.push({ $limit: parseInt(limit) });

    const results = await Doctor.aggregate(pipeline);

    res.json({
      success: true,
      data: results,
      page: parseInt(page),
      limit: parseInt(limit),
    });
  } catch (error) {
    console.error("Dashboard Error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};
