createCustomer = function(event){
    var ccNum = event.target.ccNum.value;
    var cvc = event.target.cvc.value;
    var expMo = event.target.expMo.value;
    var expYr = event.target.expYr.value;
    var email = Meteor.user().emails[0];

    Stripe.card.createToken({
        number: ccNum,
        cvc: cvc,
        exp_month: expMo,
        exp_year: expYr,
        email:email
    }, function(status, response) {
        var callArg = {};
        //callArg.stripeToken = response.id;

        if(response.error){
            Session.set('cardEnterError', response.error);
        } else {
            Meteor.call('createCustomer', callArg, function(err,data){
                if(err){
                    console.log(err);
                } else{
                    Meteor.users.update(Meteor.userId(), {$set:{profile:{stripeId:data.id}}});
                }
            });
        }
    });

    event.target.ccNum.value = '';
    event.target.cvc.value = '';
    event.target.expMo.value = '';
    event.target.expYr.value = '';

    return false;
};

createCharge = function(event){
    var callArg = {
        stripeId: Meteor.user().profile.stripeId,
        amount:Session.get('item').price * 1000
    };

    Meteor.call('chargeCard', callArg, function(err,data){
        if(err){
            console.log(err);
        } else{
            Session.set('charge', data);
        }
    });
};

if(Meteor.isClient){
    Tracker.autorun(function () {
        if(Session.get("charge")){
            var charge = Session.get("charge");

            if(charge.status === "succeeded"){
                successFunction();
            }
        }
    });


    Template.purchaseView.events({
        'submit .ccform':function(event){
            createCustomer(event);

            return false;
        },
        'click .purchase':function(event){
            this.ownerId = Meteor.userId();

            Session.set('item', this);

            createCharge(event);
            return false;
        }
    });

    Template.purchaseView.helpers({
        userOwnsItem:function(){
            var item = Session.get('item');
            return item.ownerId === Meteor.userId();
        },
        charge:function(){
            return Session.get('charge');
        }
    });

    Template.creditCardForm.helpers({
        cardEnterError:function(){
            return Session.get('cardEnterError');
        }
    });

    Meteor.startup(function() {
        Session.setDefault('charge', {status:"n/a"});

        Stripe.setPublishableKey(Meteor.settings.public.stripe.publishableKey);

        var handler = StripeCheckout.configure({
            key: Meteor.settings.public.stripe.publishableKey,
            token: function(token) {

            }
        });
    });
}