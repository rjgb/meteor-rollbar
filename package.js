Package.describe({
  name: 'rjgb:rollbar',
  version: '1.0.3',
  summary: 'Rollbar error reporting integrations for Meteor',
  documentation: 'README.md'
});

Package.onUse(function(api) {
  api.versionsFrom('METEOR@1.4');

  Npm.depends({
    rollbar: '0.6.5'
  });

  api.addFiles('lib/server/rollbar-server.js', 'server');
  api.addFiles('lib/client/rollbar-client.js', 'client');
  api.addAssets('lib/private/client-head.html', 'server');

  api.export([
    'throwError',
    'handleError'
  ], 'client');

  api.export([
    'rollbar',
    'throwError',
    'handleError'
  ], 'server');
});
