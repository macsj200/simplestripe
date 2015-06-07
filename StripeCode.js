/**
 * Created by macsj200 on 5/30/15.
 */
if(Meteor.isServer){
    Meteor.publish("userData", function () {
        if (this.userId) {
            return Meteor.users.find({_id: this.userId},
                {fields: {'stripe': 1}});
        } else {
            this.ready();
        }
    });

    Meteor.methods({
        obtainAccessToken:function(query){
            if(query.error){
                console.log(query.error);
                return query.error;
            } else{
                var url = "https://connect.stripe.com/oauth/token?" + "code=" + query.code +"&client_secret=" + Meteor.settings.private.stripe.testSecretKey + "&grant_type=authorization_code";

                var result = Meteor.http.call("POST", url);

                Meteor.users.update({_id:Meteor.userId()}, {$set: {stripe: result.data} } );

                if(result.data.stripe_user_id){
                    Roles.addUserToRoles(Meteor.userId(), 'vendor');
                }

                return result.data;
            }
        },
        chargeCard:function(token,activity){
            var Stripe = StripeAPI(Meteor.settings.private.stripe.testSecretKey);

            Stripe.charges.create({
                amount: activity.cost * 100,
                currency: 'usd',
                source: token.id,
                destination:Meteor.users.findOne(activity.vendor).stripe.stripe_user_id
            }, function(err, charge) {
                console.log(err, charge);
            });
        }
    });

}

Router.route('/api/stripeoauth/').get(function () {
    if(!Meteor.user().stripe){
        Meteor.call('obtainAccessToken', this.params.query, function(err,data){
            Session.set('stripeErr',err);
            Session.set('stripeData',data);
        });
    }

    this.render('StripeOauthPage');
});

if(Meteor.isClient){
    Meteor.startup(function(){
        Stripe.setPublishableKey(Meteor.settings.public.stripe.testPublishableKey);

        handler = StripeCheckout.configure({
            key: Meteor.settings.public.stripe.testPublishableKey,
            image: '/img/documentation/checkout/marketplace.png',
            token: function(token) {
                Meteor.call('chargeCard', token, Session.get('currentItem'));
            }
        });
    });

    Meteor.subscribe("userData");

    Template.stripeOauthTemplate.helpers({
        stripeData:function(){
            return Session.get('stripeData');
        },
        stripeErr:function(){
            return Session.get('stripeErr');
        }
    });

    Template.connectToStripeButtonTemplate.helpers({
        stripeClientId:function(){
            return Meteor.settings.public.stripe.clientId;
        }
    });

    Template.payForItemButtonTemplate.events({
        'click #payForItemButton':function(event){
            Session.set('currentItem', this);
            handler.open({
                name: 'Demo Site',
                description: this.name,
                amount: this.amount * 1000
            });
        }
    });
}
