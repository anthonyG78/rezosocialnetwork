module.exports = {
	dev : {
		server : {
			domain : "127.0.0.1",
			// port : parseInt(process.env['PORT'] || process.env['npm_package_config_port'] || 9999),
			port : 9999,
		},
		session : {
		    secret : "123456789SECRET",
		    saveUninitialized : false,
		    resave : false,
		},
		mongo : {
			uri : "mongodb://127.0.0.1:27017/rezo"
		},
		mongoStore : {
			autoRemove: 'native', // Clean session in bdd
			touchAfter: 12 * 3600 // Resave session only after 12 hours
		},
		handlebars : {
			defaultLayout : "site",
			extname : ".hbs",
			helpers: {
		        ifCond : function (v1, v2, options) {
					if(v1 === v2) {
						return options.fn(this);
					}
					return options.inverse(this);
				},
				modulo : function (i, modulo){
					if(i%modulo === 0) {
						return options.fn(this);
					}
					return options.inverse(this);
				},
				getAvatar : function (userId, avatar) {
					if(avatar){
						return '/'+userId+'/'+avatar;
					}else{
						return '/img/defaultavatar.png';
					}
				},
		    },
		},
		app : {
			siteName : "REZO",
			slogan: "Ne perdez pas le contact et restez dans toujours dans la zone de vos proches",
			shortSlogan : "Restez dans la zone",
			ageLegal : 18,
			userMinFields: '_id username firstname lastname avatar connected'
		},
	}
};