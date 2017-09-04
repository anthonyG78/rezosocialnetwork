module.exports = {
	dev : {
		server : {
			domain : "127.0.0.1",
			// port : parseInt(process.env['PORT'] || process.env['npm_package_config_port'] || 9999),
			port : 9999,
			headers: {
				'Access-Control-Allow-Origin': '*',
				'Access-Control-Allow-Headers': 'X-Requested-With,Content-Type,Authorization',
				'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
			},
		},
		client: {
			path: '/dist/index.html',
		},
		jwt: {
			secretOrKey: 'tasmanianDevil',
			session: false,
		},
		mongo : {
			uri : "mongodb://127.0.0.1:27017/rezo"
		},
		app : {
			// siteName : "REZO",
			// slogan: "Ne perdez pas le contact et restez dans toujours dans la zone de vos proches",
			// shortSlogan : "Restez dans la zone",
			// ageLegal : 18,
			userMinFields: '_id username firstName lastName avatar connected'
		},
	},
	production: {
		server : {
			domain : "",
			port : parseInt(process.env['PORT'] || 9999),
			headers: {
				'Access-Control-Allow-Origin': '*',
				'Access-Control-Allow-Headers': 'X-Requested-With,Content-Type,Authorization',
				'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
			},
		},
		client: {
			path: '/dist/index.html',
		},
		jwt: {
			secretOrKey: 'jwtForRezoApp',
			session: false,
		},
		mongo : {
			uri : process.env.MONGOLAB_URI
		},
		app : {
			userMinFields: '_id username firstName lastName avatar connected'
		},
	}
};