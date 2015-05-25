clientCreateCustomer = function(event){
    var ccNum = event.target.ccNum.value;
    var cvc = event.target.cvc.value;
    var expMo = event.target.expMo.value;
    var expYr = event.target.expYr.value;

    Stripe.card.createToken({
        number: ccNum,
        cvc: cvc,
        exp_month: expMo,
        exp_year: expYr
    }, function(status, response) {
        var callArg = {};
        callArg.stripeToken = response.id;

        Meteor.call('createCustomer', callArg, function(err,data){
            if(err){
                console.log(err);
            } else{
                Meteor.users.update(Meteor.userId(), {$set:{profile:{stripeId:data.id}}});
            }
        });
    });

    event.target.ccNum.value = '';
    event.target.cvc.value = '';
    event.target.expMo.value = '';
    event.target.expYr.value = '';

    return false;
};

handlePurchase = function(event){
    var callArg = {
        stripeId: Meteor.user().profile.stripeId
    };

    Meteor.call('chargeCard', callArg, function(err,data){
        Session.set('charge', data);
        Session.set('chargeError', err);
    });
};

Meteor.startup(function() {
    Session.setDefault('charge', null);
    Session.setDefault('chargeError', null);

    Stripe.setPublishableKey(Meteor.settings.public.stripe.publishableKey);

    var handler = StripeCheckout.configure({
        key: Meteor.settings.public.stripe.publishableKey,
        token: function(token) {

        }
    });
});