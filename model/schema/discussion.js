const mongoose = require('mongoose');
const discussionMessageSchema = require('./discussionMessage');

module.exports = {
    state: {
        type    : Boolean, 
        default : true
    },
    ownerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'accounts',
    },
    subject: {
        type: String,
        trim: true,
    },
    messages: [discussionMessageSchema],
    date        : {
        type    : Date, 
        default : Date.now
    },
};