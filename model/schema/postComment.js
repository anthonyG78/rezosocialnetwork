const mongoose = require('mongoose');

module.exports = {
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'accounts',
    },
    text: {
        type    : String, 
        trim    : true,
        required : [true, 'Le texte est obligatoire'],
    },
    date        : {
        type    : Date, 
        default : Date.now
    },
};