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
                if(!Meteor.users.findOne(this.userId).stripe){
                    var url = "https://connect.stripe.com/oauth/token?" + "code=" + query.code +"&client_secret=" + orion.config.get('STRIPE_API_SECRET') + "&grant_type=authorization_code";

                    var result = Meteor.http.call("POST", url);

                    Meteor.users.update({_id:this.userId}, {$set: {stripe: result.data} } );

                    if(result.data.stripe_user_id){
                        Roles.addUserToRoles(this.userId, 'vendor');
                    }

                    return result.data;
                } else {
                    console.log('User already has stripe profile');
                }
            }
        },
        chargeCard:function(token,item){
            var Stripe = StripeAPI(orion.config.get('STRIPE_API_SECRET'));

            var user = Meteor.users.findOne(item.createdBy);

            var res = Async.runSync(function(done) {
                Stripe.charges.create({
                    amount: Math.round(item.price * 100),
                    currency: 'usd',
                    source: token.id,
                    destination: user.stripe.stripe_user_id
                }, function (err, charge) {

                    if(!user.transactions){
                        user.transactions = [charge];
                    } else {
                        user.transactions.push(charge);
                    }

                    done(err, charge);
                })
            });

            Meteor.users.update({_id:this.userId}, {$set: {transactions: user.transactions} } );

            console.log(user.transactions);

            return res;
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
        Stripe.setPublishableKey(orion.config.get('STRIPE_API_KEY'));

        handler = StripeCheckout.configure({
            key: orion.config.get('STRIPE_API_KEY'),
            image: '/img/documentation/checkout/marketplace.png',
            token: function(token) {
                Meteor.call('chargeCard', token, Session.get('currentItem'),function(err,data){
                    Session.set('stripeErr',err);
                    Session.set('stripeData',data.result);
                });
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

    Template.payForItem.helpers({
        stripeData:function(){
            return Session.get('stripeData');
        },
        stripeErr:function(){
            return Session.get('stripeErr');
        }
    });

    Template.connectToStripeButtonTemplate.helpers({
        stripeClientId:function(){
            return orion.config.get('STRIPE_API_CLIENT_ID');
        }
    });

    Template.payForItemButtonTemplate.events({
        'click #payForItemButton':function(event){
            Session.set('currentItem', this);
            handler.open({
                name: 'Demo Site',
                description: this.name,
                amount: Math.round(this.price * 100)
            });
        }
    });

    Template.payForItemButtonTemplate.helpers({
        stripeData:function(){
            return Session.get('stripeData');
        },
        stripeErr:function(){
            return Session.get('stripeErr');
        }
    });
}

/**
 * Initializes the variables, so you can
 * edit them in the admin panel
 */
orion.config.add('STRIPE_API_KEY', 'stripe');
orion.config.add('STRIPE_API_CLIENT_ID', 'stripe');
orion.config.add('STRIPE_API_SECRET', 'stripe', {secret: true});
