import mongoose from 'mongoose';

const categorySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  keywords: [{
    type: String
  }]
});

export const Category = mongoose.model('Category', categorySchema);
export default Category;