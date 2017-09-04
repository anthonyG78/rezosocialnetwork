const router    = require('express').Router();
const Account     = require('../../model/accounts');

module.exports  = function(app){
    router.get('/', (req, res, next) => {
        Account.getNotifications(req.user._id)
            .then(notifications => {
                res.json(notifications);
            })
            .catch(err => {
                return next(err);
            });
    });

    router.delete('/', (req, res, next) => {
        const notification = req.body;

        Account.deleteNotification(req.user._id, notification.key, notification.value)
            .then(notifications => {
                res.json(notifications);
            })
            .catch(err => {
                return next(err);
            });
    });

    return router;
}