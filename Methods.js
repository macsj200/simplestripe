if(Meteor.isServer){
    var done = function(err, result){
        console.log(err,result);
    };

    Meteor.methods({
        chargeCard:function(argObject){
            var Stripe = StripeAPI(Meteor.settings.stripe.secretKey);

            var charge = null;
            var charge = Async.runSync(function(done){
                Stripe.charges.create({
                    amount: argObject.amount,
                    currency: 'usd',
                    customer: argObject.stripeId
                },done);
            }).result;

            //Stripe.charges.create({
            //    amount: argObject.amount,
            //    currency: 'usd',
            //    customer: argObject.stripeId
            //},function(err,result){
            //    if(err){
            //        console.log(err);
            //    } else{
            //        charge = result;
            //        console.log('assigned charge ', charge);
            //    }
            //});
            //
            //console.log('returning charge', charge);

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