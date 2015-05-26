if(Meteor.isServer){
    var done = function(err, result){
        console.log('api call done',err,result);
    };

    Meteor.methods({
        chargeCard:function(argObject){
            var Stripe = StripeAPI(Meteor.settings.stripe.secretKey);

            var charge = null;

            var apiResult = Async.runSync(function(done){
                Stripe.charges.create({
                    amount: argObject.amount,
                    currency: 'usd',
                    customer: argObject.stripeId
                },done);
            });

            //code to forward response to client

            if(apiResult.result){
                //if successful
                charge = apiResult.result;
            } else{
                //if error
                charge = apiResult;
            }

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
}