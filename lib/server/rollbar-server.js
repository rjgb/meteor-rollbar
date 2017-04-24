rollbar = Npm.require('rollbar');
var http = Npm.require('http');

var environmentVarsRequired = [
  'ROLLBAR_SERVER_ACCESS_TOKEN'
];

rollbarServerAccessToken = null;
rollbarClientAccessToken = null;

var getUserPayload = function(userId) {
  var userPayload = {};
  if (userId) {
    var user = Meteor.users.findOne({_id: userId});
    userPayload = {
      id: userId,
      username: user.profile && user.profile.username
    };
  } else {
    userPayload = null;
  }

  return userPayload;
};

var allNecessaryKeysAvailable = function() {
  if (Meteor.settings['private'].rollbarServerAccessToken) {
    return true;
  }
  return _.reduce(_.map(environmentVarsRequired, function(envVar) {
    return !_.isUndefined(process.env[envVar]);
  }), function(memo, item) {
    return memo && item;
  }, true);
};

var reportAPIConnectionNotPossible = function() {
  var message = '';
  message = 'Cannot connect to Rollbar API as the following variables are not available: [ '
    + environmentVarsRequired.join(', ') + ' ]';
  console.log(message);
};

throwErrorIfNotInitialised = function() {
  if (!allNecessaryKeysAvailable()) {
    throw new Meteor.Error(403, 'Cannot connect to Rollbar API as the following variables are not available: [ '
    + environmentVarsRequired.join(', ') + ' ]');
  }
};

throwError = function(message) {
  check(message, String);
  throwErrorIfNotInitialised();
  var exceptionDetails = arguments.length > 1  ? arguments[1] : {};
  var logLevel = arguments.length > 2 ? arguments[2] : 'error';
  check(exceptionDetails, Object);
  check(logLevel, String);
  rollbar.reportMessageWithPayloadData(message, {
    level: logLevel,
    person: getUserPayload(this.userId),
    headers: this.connection && this.connection.httpHeaders,
    custom: exceptionDetails
  }, {}, function(err) {
    if (err) {
      console.log('saucecode:rollbar: failed to throw error to rollbar.');
      console.log(err);
    }
  });
};

handleError = function(error) {
  var payloadData = arguments.length > 1 ? arguments[1] : {};
  var logLevel = arguments.length > 2 ? arguments[2] : 'error';
  check(payloadData, Object);
  check(logLevel, String);
  throwErrorIfNotInitialised();
  rollbar.handleErrorWithPayloadData(error, {
    level: logLevel,
    person: getUserPayload(this.userId),
    headers: this.connection && this.connection.httpHeaders,
    custom: payloadData
  }, function(err) {
    if (err) {
      console.log('saucecode:rollbar: failed to post error to rollbar.');
      console.log(err);
    }
  });
};

var methods = {
  logClientError: function(method, arguments) {
    var fn = rollbar[method];
    if (fn)
      fn.apply(this, arguments);
  },

  getRollbarClientConfig: function() {
    return {
      accessToken: rollbarClientAccessToken,
      captureUncaught: true,
      payload: {
        environment: rollbarEnvironment || 'production'
      }
    };
  },

  throwError: function() {
    check(arguments, [Match.Any]);
    throwError.apply(this, arguments); // Using apply to use array of args
  },

  handleError: function() {
    check(arguments, [Match.Any]);
    handleError.apply(this, arguments);
  }
};

insertRollbarBrowserClient = function(rollbarClientAccessToken, rollbarEnvironment) {
  var rollbarHeader = Assets.getText('lib/private/client-head.html').
    replace('POST_CLIENT_ITEM_ACCESS_TOKEN', rollbarClientAccessToken).
    replace('ENVIRONMENT', rollbarEnvironment);
  var originalWrite = http.OutgoingMessage.prototype.write;
  http.OutgoingMessage.prototype.write = function(chunk, encoding) {
    if (!this.iInjected && encoding === undefined && /^<!DOCTYPE html>/.test(chunk)) {
      chunk = chunk.toString().replace('<head>', '<head>\n' + rollbarHeader);
      this.iInjected = true;
    }

    originalWrite.call(this, chunk, encoding);
  };
};

Meteor.startup(function() {
  if (allNecessaryKeysAvailable()) {
    rollbarServerAccessToken = process.env.ROLLBAR_SERVER_ACCESS_TOKEN || Meteor.settings['private'].rollbarServerAccessToken;
    rollbarClientAccessToken = process.env.ROLLBAR_CLIENT_ACCESS_TOKEN || Meteor.settings['public'].rolllclientAccessToken;
    rollbarEnvironment = process.env.ROLLBAR_ENVIRONMENT || Meteor.settings['public'].rollbarEnvironment || 'development';
    rollbar.init(rollbarServerAccessToken, {
      environment: rollbarEnvironment
    });

    // inject client-side Rollbar init code
    if (rollbarClientAccessToken) {
      insertRollbarBrowserClient(rollbarClientAccessToken, rollbarEnvironment);
    }

    rollbar.handleUncaughtExceptions(rollbarServerAccessToken, { exitOnUncaughtException: true });
    Meteor.methods(methods);
  } else {
    reportAPIConnectionNotPossible();
  }
});
