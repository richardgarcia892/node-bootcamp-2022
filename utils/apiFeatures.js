class APIFeatures {
  // Query stands for the mongo Query Object, queryString is the API call queryString from req object
  constructor(query, queryString) {
    this.query = query;
    this.queryString = queryString;
  }

  filter() {
    // 1A - SIMPLE FILTERING
    const queryObj = { ...this.queryString }; // Shallow copy the req.query objects
    const excludeFields = ['page', 'sort', 'limit', 'fields']; // Define Query parameters to exclude from Database Query as they are related to API result filtering
    excludeFields.forEach(el => delete queryObj[el]); // Delete the excluded fields from query Object

    // 1B - ADVANCED FILTERING
    // Turn queryObj to String, and use REGEX to concat all mongo operators with the $ at for the actual query to work
    const queryStr = JSON.stringify(queryObj).replace(/\b(gte|gt|lte|lt)\b/g, match => `$${match}`);

    this.query = this.query.find(JSON.parse(queryStr)); // Query object must be created before being executed to perform all sort of filtering and pagination tasks
    return this;
  }

  sort() {
    // 2 - SORTING
    if (this.queryString.sort) {
      const sortBy = this.queryString.sort.split(',').join(' ');
      this.query = this.query.sort(sortBy);
    } else {
      this.query = this.query.sort('price');
    }
    return this;
  }

  limit() {
    // 3 - LIMITING RESULTS
    if (this.queryString.fields) {
      const fields = this.queryString.fields.split(',').join(' ');
      this.query = this.query.select(fields);
    } else {
      this.query = this.query.select('-__v');
    }
    return this;
  }

  paginate() {
    // 4 - PAGINATION
    const page = this.queryString.page * 1 || 1;
    const limit = this.queryString.limit * 1 || 100;
    const skip = (page - 1) * limit; // Formula to calculate how much results to skip based on defined page
    // Page=3&limit=10, 1-10 page 1, 11-20, page 2, 21-30 page 3
    this.query = this.query.skip(skip).limit(limit);
    return this;
  }
}

module.exports = APIFeatures;
