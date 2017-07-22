const mongoose = require('mongoose');

module.exports = {
	username 	: {
		type 	: String, 
		trim 	: true,
		min 	: [2, 'Le pseudo est trop court'],
		max 	: [15, 'Le pseudo est trop long (15 caractères max)'],
		required : [true, 'Le pseudo est obligatoire'],
	},
	firstName 	: {
		type 	: String,
		trim 	: true,
		min 	: [2, 'Le prénom est trop court'],
		max 	: [20, 'Le prénom est trop long (20 caractères max)'],
		required : [true, 'Le prénom est obligatoire'], 
	},
	lastName 	: {
		type 	: String, 
		trim 	: true,
		min 	: [2, 'Le nom est trop court'],
		max 	: [20, 'Le nom est trop long (20 caractères max)'],
		required : [true, 'Le nom est obligatoire'], 
	},
	gender 		: {
		type 	: String, 
		trim 	: true,
		enum 	: ['homme', 'femme'],
		required : [true, "Le genre est obligatoire"],
	},
	email 		: {
		type 	: String, 
		trim 	: true,
		unique 	: true,
		required : [true, "L'email est obligatoire"],
		validate : {
			validator : function (email) {
				return /^([\w-\.]+@([\w-]+\.)+[\w-]{2,4})?$/.test(email);
			},
			message : "L'adresse mail n'est pas valide"
		},
	},
	password	: {
		type 	: String, 
		trim 	: true,
	},
	avatar 		: {
		type 	: String, 
		trim 	: true,
	},
	background 	: {
		type 	: String,
		trim 	: true,
	},
	desription : {
		type : String,
		trim : true,
	},
	age 	: {
		type 	: Date
	},
	preferences : {
		type 	: Array
	},
	friends: [{
		userId: {
	        type: mongoose.Schema.Types.ObjectId,
	        ref: 'accounts',
    	},
    	accepted: {
    		type: Boolean,
    		default: false
    	} 
    }],
    posts: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'posts',
	}],
    discussions: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'discussion',
	}],
	chats: [{
		type: mongoose.Schema.Types.ObjectId,
        ref: 'discussion',
	}],
    level: {
    	type: Number,
    	default: 0,
    	validate : {
			validator : function (level) {
				return level >= 0;
			},
			message : "Le niveau de l'utilisateur est incorret"
		},
    },
	date 		: {
		type 	: Date, 
		default : Date.now
	},
	connected 	: {
		type 	: Boolean, 
		default : false
	}
};