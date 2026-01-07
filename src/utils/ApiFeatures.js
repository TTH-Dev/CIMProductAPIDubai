import mongoose from "mongoose";
class APIFeatures {
  query;
  queryString;

  constructor(query, queryString) {
    this.query = query;
    this.queryString = queryString;
  }

  filter() {
    const queryObj = { ...this.queryString };
    const excludedFields = ["page", "sort", "limit", "fields"];
    excludedFields.forEach((el) => delete queryObj[el]);

    let queryStr = JSON.stringify(queryObj);
    queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, (match) => `$${match}`);

    this.query = this.query.find(JSON.parse(queryStr));

    return this;
  }

  advancedFilter() {
    const queryObj = { ...this.queryString };
    const excludedFields = ["page", "sort", "limit", "fields"];
    excludedFields.forEach((el) => delete queryObj[el]);

    let queryStr = JSON.stringify(queryObj);
    queryStr = queryStr.replace(/\b(in|nin)\b/g, (match) => `$${match}`);

    this.query = this.query.find(JSON.parse(queryStr));

    return this;
  }

  sort() {
    if (this.queryString.sort) {
      const sortBy = this.queryString.sort.split(",").join(" ");
      this.query = this.query.sort(sortBy);
    }
    return this;
  }

  limitFields() {
    if (this.queryString.fields) {
      const fields = this.queryString.fields.split(",").join(" ");
      this.query = this.query.select(fields);
    } else {
      this.query = this.query.select("-__v");
    }

    return this;
  }

 paginate() {
    const page = this.queryString.page ? parseInt(this.queryString.page) : 1;
    const limit = this.queryString.limit
      ? parseInt(this.queryString.limit)
      : 10;
    const skip = (page - 1) * limit;

    this.query = this.query.skip(skip).limit(limit);

    return this;
  }
  populateAll(schema) {
    const pathsToPopulate = [];
  
    for (const [key, val] of Object.entries(schema.paths)) {
      if (val.options?.ref) {
        const refModel = val.options.ref;
  
        if (mongoose.modelNames().includes(refModel)) {
          const refSchema = mongoose.model(refModel).schema;
  
          const nestedPaths = Object.entries(refSchema.paths)
            .filter(([_, nestedVal]) => nestedVal.options?.ref)
            .map(([nestedKey]) => ({ path: nestedKey }));
  
          if (nestedPaths.length > 0) {
            pathsToPopulate.push({
              path: key,
              populate: nestedPaths
            });
          } else {
            pathsToPopulate.push({ path: key });
          }
        } else {
          pathsToPopulate.push({ path: key });
        }
      }
    }
  
    pathsToPopulate.forEach((popOption) => {
      this.query = this.query.populate(popOption);
    });
  
    return this;
  }
  

}

export default APIFeatures;
