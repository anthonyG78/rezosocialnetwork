const mongoose = require('mongoose');
const postCommentSchema = require('./postComment');

module.exports = {
    fromUserId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'accounts',
    },
    toUserId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'accounts',
    },
    title: {
        type    : String, 
        // trim    : true,
        min     : [2, 'Le titre est trop court (2 caractères min)'],
        max     : [20, 'Le titre est trop long (20 caractères max)'],
        required : [true, 'Le titre est obligatoire'],
    },
    text: {
        type    : String, 
        // trim    : true,
        min     : [10, 'Le texte est trop court (10 caractères min)'],
        max     : [480, 'Le texte est trop long (480 caractères max)'],
        required : [true, 'Le texte est obligatoire'],
    },
    image: {
        type: String,
        trim: true,
    },
    comments: [postCommentSchema],
    date        : {
        type    : Date, 
        default : Date.now
    },
};