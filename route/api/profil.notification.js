const router    = require('express').Router();
const Account     = require('../../model/accounts');

module.exports  = function(app){
    router.get('/', (req, res, next) => {
        Account.getNotificationsFor(req.user._id)
            .then(notifications => {
                res.json(notifications);
            })
            .catch(err => {
                return next(err);
            });
    });

    router.delete('/', (req, res, next) => {
        const notification = req.body;

        Account.deleteNotificationFor(req.user._id, notification.key, notification.value)
            .then(notifications => {
                res.json(notifications);
            })
            .catch(err => {
                return next(err);
            });
    });

    return router;
}