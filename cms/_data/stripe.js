// Expose Stripe publishable key to templates
require('dotenv').config();

module.exports = function() {
  return {
    publishableKey: process.env.STRIPE_PUBLISHABLE_KEY || ''
  };
};
