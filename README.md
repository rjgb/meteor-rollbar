# rjgb:rollbar

Kickass [Rollbar](https://rollbar.com/) integration for Meteor projects.

Current Rollbar version is 0.6.5.

### Installation

1. Run `meteor add rjgb:rollbar`
2. Set `'ROLLBAR_SERVER_ACCESS_TOKEN'` evnironment variable or `Meteor.settings['private'].rollbarServerAccessToken`.
3. Optional environment variables:<br>
`'ROLLBAR_CLIENT_ACCESS_TOKEN'` - Set to enable the browserJS rollbar reporter.<br>
`'ROLLBAR_ENVIRONMENT'` - Set reporting environment.<br>
`'ROLLBAR_EXIT_ON_UNCAUGHT_EXCEPTION'` - Defaults to true.
4. Optional Meteor settings:<br>
`Meteor.settings['public'].rolllclientAccessToken` - Set to enable the browserJS rollbar reporter.<br>
`Meteor.settings['public'].rollbarEnvironment` - Set reporting environment.<br>
`Meteor.settings['private'].rollbarExitOnUncaughtException` - Defaults to true.
5. Run meteor

Example with environment variables.

```bash
$ meteor add saucecode:rollbar
$ ROLLBAR_SERVER_ACCESS_TOKEN=acefaketoken1 ROLLBAR_CLIENT_ACCESS_TOKEN=acefaketoken2imsocreative ROLLBAR_ENVIRONMENT=development ROLLBAR_EXIT_ON_UNCAUGHT_EXCEPTION=false meteor
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


