# Simple Stripe API

This library is a simplified version of [stripe-meteor](https://github.com/tyler-johnson/stripe-meteor), see those docs for a complete reference

# Installation

1. Create a meteor project
2. `meteor add maxjohansen:simplestripe`

# Installation from github
2. Create a packages directory in the project
3. Clone [simplestripe](https://github.com/macsj200/simplestripe) into packages folder
4. Change back to project root and install package `meteor add simplestripe`

# Usage

1. Add a settings.json file (copy format of samplesettings.json inside of package) to your project root directory and launch meteor `meteor --settings settings.json`
2. Add creditCardForm template inside of your item purchase page.  This is used to attach a stripe id to the user object
3. Add a listener for `submit .ccform` on the template containing creditCardForm and call `createCustomer(event)`
4. Add a listener for a purchase event.  Set item session variable to item for purchase (must have price field).  Call `createCharge(event)`
5. Create a global function called `successFunction` (called when charge goes through) and set item session variable attributes/update db as needed inside.

# Notes

This is a very new project subject to drastic changes.
You can use charge.status to get the status of a charge (n/a for no charge submitted).