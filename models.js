const mongoose = require('mongoose');

const EntrySchema = mongoose.Schema({
	author: {
		firstName: String,
		lastName: String
	},
	title: {type: String, required: true},
	content: {type: String},
	created: {type: Date, default: Date.now}
});


EntrySchema.virtual('authorName').get(function() {
  return `${this.author.firstName} ${this.author.lastName}`.trim();
});

EntrySchema.methods.apiRepr = function() {
  return {
    id: this._id,
    author: this.authorName,
    content: this.content,
    title: this.title,
    created: this.created
  };
}

module.exports = mongoose.model('entry', EntrySchema);