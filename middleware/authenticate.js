const passport  = require('passport');
const Account   = require('../model/accounts');
const Promise   = global.Promise || require('promise');
const fs 		= require('fs');

module.exports  = {
	login: function(req, res, next) {
		return new Promise((resolve, reject) => {
			passport.authenticate('local', (err, user, info) => {
	            if(err){
	                return reject(err);
	            }

	            if (!user) {
	                return reject(info.message || 'Impossible de se connecter');
	            }

	            console.log(this);

	            this.update(req, user)
	            	.then(user => {
	            		return Account.setConnectionStatus(user._id, true);
	            	})
	            	.then(status => {
	            		resolve(user);
	            	})
	            	.catch(err => {
	            		return reject(err);
	            	});
	        })(req, res, next);
		});
	},

	logout: (req, res, next) => {
		return new Promise(function(resolve, reject){
			if(!req.isAuthenticated()){
	            return reject('No user');
	        }

	        // CONSERVER ID USER ICI !!
			const userId = req.user._id;

            req.logout();
            req.session.save((err) => {
                if (err) {
                    return reject(err);
                }

                Account.setConnectionStatus(userId, false)
                	.then(result => {
                		resolve(result);
                	})
                	.catch(err => {
                		return reject(err);
                	});
            });
        });
	},

	register: (req, res, next) => {
		return new Promise((resolve, reject) => {
			var body        = req.body;

	        Account.register(new Account(body), body.password, (err, user) => {
	            if (err) {
	                return reject(err);
	            }

	            passport.authenticate('local')(req, res, () => {
	                fs.mkdir('./file/'+user._id+'/', err => {
	                	if(err){
	                		return reject(err);
	                	}

		                req.session.save(err => {
		                    if (err) {
		                        return reject(err);
		                    }

		                    // resolve(user);
		                    Account.setConnectionStatus(user._id, true)
			                	.then(result => {
			                		resolve(user);
			                	})
			                	.catch(err => {
			                		return reject(err);
			                	});
		                });
	                });

	            });
	        });
		});
	},

	delete: (req, res, next) => {
		// DELETE AN ACCOUNT
	},

	update: (req, user) => {
		return new Promise((resolve, reject) => {
			req.login(user, (err) => {
                if (err) {
                    return reject(err);
                }

                resolve(user);
            });
		});
	}
};