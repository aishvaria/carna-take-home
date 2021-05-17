const mongoose = require('mongoose');


const courseSchema = mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
        },
        description: {
            type: String,
            required: true
        },
        author: {
            type: String,
            required: true
        },
        image: {
            type: String,
            default: ''
        },
        price : {
            type: Number,
            required:true
        },
        category: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Category',
            required:true
        },
        userEnrolled: {
            type: Number,
            default:0
        },
        rating: {
            type: Number,
            default: 0,
        },
        numReviews: {
            type: Number,
            default: 0,
        },
        isFeatured: {
            type: Boolean,
            default: false,
        },
        dateCreated: {
            type: Date,
            default: Date.now,
        },
    })
   
    courseSchema.virtual('id').get(function () {
        return this._id.toHexString();
    });
    
    courseSchema.set('toJSON', {
        virtuals: true,
    });

exports.Course = mongoose.model('Course', courseSchema);