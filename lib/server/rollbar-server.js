rollbar = Npm.require('rollbar');
var http = Npm.require('http');

rollbarServerAccessToken = null;
rollbarClientAccessToken = null;
rollbarStarted = false;

var getUserPayload = function(userId) {
  if (userId) {
    var user = Meteor.users.findOne({_id: userId});
    if (user) {
      return {
        id: userId,
        username: user.profile && user.profile.username
      };
    }
  }

  return {};
};

throwError = function(message) {
  if (!rollbarStarted) {
    throw new Meteor.Error(403, 'Cannot connect to Rollbar API. No server access token.');
  }

  if (typeof message === 'string' || message instanceof String) {
    var exceptionDetails = arguments.length > 1  ? arguments[1] : {};
    var logLevel = arguments.length > 2 ? arguments[2] : 'error';

    if ((exceptionDetails !== null && typeof exceptionDetails === 'object')
      && (typeof logLevel === 'string' || logLevel instanceof String)) {
      rollbar.reportMessageWithPayloadData(message, {
        level: logLevel,
        person: getUserPayload(this.userId),
        headers: this.connection && this.connection.httpHeaders,
        custom: exceptionDetails
      }, {}, function (err) {
        if (err) {
          console.log('rjgb:rollbar: failed to throw error to rollbar.');
          console.log(err);
        }
      });
    }
  }
};

handleError = function(error) {
  if (!rollbarStarted) {
    throw new Meteor.Error(403, 'Cannot connect to Rollbar API. No server access token.');
  }

  var payloadData = arguments.length > 1 ? arguments[1] : {};
  var logLevel = arguments.length > 2 ? arguments[2] : 'error';

  if ((payloadData !== null && typeof payloadData === 'object')
    && (typeof logLevel === 'string' || logLevel instanceof String)) {
    rollbar.handleErrorWithPayloadData(error, {
      level: logLevel,
      person: getUserPayload(this.userId),
      headers: this.connection && this.connection.httpHeaders,
      custom: payloadData
    }, function(err) {
      if (err) {
        console.log('rjgb:rollbar: failed to post error to rollbar.');
        console.log(err);
      }
    });
  }
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
  var rollbarHeader = Assets.getText('lib/private/client-head.html')
    .replace('POST_CLIENT_ITEM_ACCESS_TOKEN', rollbarClientAccessToken)
    .replace('ENVIRONMENT', rollbarEnvironment);

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
  rollbarServerAccessToken = process.env.ROLLBAR_SERVER_ACCESS_TOKEN || Meteor.settings['private'].rollbarServerAccessToken || false;

  if (rollbarServerAccessToken) {
    rollbarClientAccessToken = process.env.ROLLBAR_CLIENT_ACCESS_TOKEN || Meteor.settings['public'].rollbarClientAccessToken || '';
    rollbarEnvironment = process.env.ROLLBAR_ENVIRONMENT || Meteor.settings['public'].rollbarEnvironment || 'development';
    exitOnUncaughtException = process.env.ROLLBAR_EXIT_ON_UNCAUGHT_EXCEPTION || Meteor.settings['private'].rollbarExitOnUncaughtException || true;

    rollbar.init(rollbarServerAccessToken, {
      environment: rollbarEnvironment
    });

    // inject client-side Rollbar init code
    if (rollbarClientAccessToken) {
      insertRollbarBrowserClient(rollbarClientAccessToken, rollbarEnvironment);
    }

    rollbar.handleUncaughtExceptions(rollbarServerAccessToken, {
      exitOnUncaughtException: exitOnUncaughtException
    });

    Meteor.methods(methods);

    rollbarStarted = true;
  }
  else {
    console.log('Cannot connect to Rollbar API. Set ROLLBAR_CLIENT_ACCESS_TOKEN environment variable or serverAccessToken setting.');
  }
});
