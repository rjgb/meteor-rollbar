# saucecode:rollbar

Kickass [Rollbar](https://rollbar.com/) integration for Meteor projects.

### Installation

1. Run `meteor add saucecode:rollbar`
2. Set `'ROLLBAR_SERVER_ACCESS_TOKEN'`, and optionally `'ROLLBAR_CLIENT_ACCESS_TOKEN'` (if you want to enable the browserJS rollbar reporter) and also optionally, the `'ROLLBAR_ENVIRONMENT'`environment variables with your [client and server access tokens for rollbar](https://rollbar.com/)
3. Or set `Meteor.settings['private'].rollbarApiSecret` and optionally `Meteor.settings['public'].rollbarApiToken` (if you want to enable the browserJS rollbar reporter) and also optionally, the `Meteor.settings['public'].rollbarEnvironment` variables with your [client and server access tokens for rollbar](https://rollbar.com/)
4. Run meteor

E.g.

```bash
$ meteor add saucecode:rollbar
$ ROLLBAR_SERVER_ACCESS_TOKEN=acefaketoken1 ROLLBAR_CLIENT_ACCESS_TOKEN=acefaketoken2imsocreative ROLLBAR_ENVIRONMENT=development meteor
```

### Usage

You have all the inbuilt [rollbar node functions](https://rollbar.com/docs/notifier/node_rollbar/) available on the server through the namespace `rollbar`. 

We have also built in two really simple and useful functions for logging errors from either the client or the server.

### `throwError()`

##### Arguments:

1. String(Mandatory): message to log to rollbar via the API.  
2. Object(Optional): each key-value pair will be reported in the same rollbar item.  Useful for adding more context to your errors
3. String(Optional): Finally, you can elect to add the log level in the third and final argument. (Default: 'error') (valid severity levels: "critical", "error", "warning", "info", "debug")


### `handleError()`

##### Arguments:

1. Exception(Mandatory): exception to log to rollbar via the API.  
2. Object(Optional): each key-value pair will be reported in the same rollbar item.  Useful for adding more context to your errors
3. String(Optional): Finally, you can elect to add the log level in the third and final argument. (Default: 'error') (valid severity levels: "critical", "error", "warning", "info", "debug")


### Other considerations

##### Browser Policy

If you are using the `browser-policy` package, you will need to add the Rollbar cloudfront distribution as a trusted script origin. You can do this with the current endpoint by adding the following to your code

```javascript
BrowserPolicy.content.allowScriptOrigin('d37gvrvc0wt4s1.cloudfront.net');
```


