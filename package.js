Package.describe({
  name: 'maxjohansen:simplestripe',
  version: '0.0.1',
  summary: 'A simplified version of https://github.com/tyler-johnson/stripe-meteor',
  git: 'https://github.com/macsj200/simplestripe',
  documentation: 'README.md'
});

Package.onUse(function(api) {
  api.use("templating", "client");
  api.use("stripe-meteor", "client");
  api.use("meteor-async", "client");
  api.versionsFrom('1.1.0.2');
  api.addFiles('[Methods.js]', 'server');
  api.addFiles('[Client.js, creditCardForm.html]', 'client');
});

Package.onTest(function(api) {
  api.use('tinytest');
  api.use('maxjohansen:simplestripe');
  api.addFiles('simplestripe-tests.js');
});
