const mongoose = require('mongoose');

module.exports = {
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'accounts',
    },
    text: {
        type    : String, 
        trim    : true,
        min     : [10, 'Le texte est trop court (10 caractères min)'],
        max     : [480, 'Le texte est trop long (480 caractères max)'],
        required : [true, 'Le texte est obligatoire'],
    },
    date        : {
        type    : Date, 
        default : Date.now
    },
};