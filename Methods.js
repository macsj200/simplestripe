var done = function(err, result){
    //console.log(err,result);
};

Meteor.methods({
    chargeCard:function(argObject){
        var Stripe = StripeAPI(Meteor.settings.stripe.secretKey);

        var charge = Async.runSync(function(done){
            Stripe.charges.create({
                amount: argObject.amount,
                currency: 'usd',
                customer: argObject.stripeId
            },done);
        }).result;

        return charge;

    },
    createCustomer:function(argObject){
        var Stripe = StripeAPI(Meteor.settings.stripe.secretKey);

        var customer = Async.runSync(function(done){
            Stripe.customers.create({
                source:argObject.stripeToken
            }, done);
        }).result;

        return customer;
    }
});
