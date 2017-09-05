// For Gmail, unlock account asses from:
// https://accounts.google.com/DisplayUnlockCaptcha
const conf       = require('../conf/conf')[process.env.NODE_ENV || 'production'].nodemailer;
const nodemailer = require('nodemailer');
const transporter = nodemailer.createTransport(conf);

module.exports = transporter;
module.exports.conf = conf;