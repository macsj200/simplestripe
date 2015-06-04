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

# Notes

This is a very new project subject to drastic changes.
You can use charge.status to get the status of a charge (n/a for no charge submitted).