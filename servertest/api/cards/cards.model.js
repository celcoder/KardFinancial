'use strict';

import mongoose from 'mongoose';

const Schema = mongoose.Schema;
const CardSchema = new Schema({
  createdOn: { type: Date, default: Date.now },
  modifiedOn: { type: Date, default: Date.now },
  name: String,
  categoryRewards: [{ type: Schema.Types.ObjectId, ref: 'CategoryRewards' }],
  mostPopular: Boolean,
  bank: String,
  network: String,
  image: String
});

export default mongoose.model('Card', CardSchema);
