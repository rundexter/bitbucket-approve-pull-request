var _ = require('lodash'),
    util = require('./util.js');

var request = require('request').defaults({
    baseUrl: 'https://api.bitbucket.org/2.0/'
});


var globalPickResult = {
    'user_uuid': 'user.uuid',
    'role': 'role',
    'user_username': 'user.username',
    'user_display_name': 'user.display_name',
    'user_url': 'user.links.self.href',
    'approved': 'isApproved'
};

module.exports = {

    authParams: function (dexter) {
        var auth = {},
            username = dexter.environment('bitbucket_username'),
            password = dexter.environment('bitbucket_password');

        if (username && password) {

            auth.user = username;
            auth.pass = password;
        }

        return _.isEmpty(auth)? false : auth;
    },

    processResult: function (error, responce, body) {

        if (error)

            this.fail(error);

        else if (responce && !body)

            this.fail(responce.statusCode + ': Something is happened');

        else if (responce && body.error)

            this.fail(responce.statusCode + ': ' + JSON.stringify(body.error));

        else

            this.complete(util.pickResult(body, globalPickResult));

    },

    checkCorrectParams: function (auth, step) {
        var result = true;

        if (!auth) {

            result = false;
            this.fail('A [bitbucket_username, bitbucket_password] environment need for this module.');
        }

        if (!step.input('owner').first() || !step.input('repo_slug').first() || !step.input('id').first()) {

            result = false;
            this.fail('A [owner, repo_slug, id] inputs need for this module.');
        }

        return result;
    },

    /**
     * The main entry point for the Dexter module
     *
     * @param {AppStep} step Accessor for the configuration for the step using this module.  Use step.input('{key}') to retrieve input data.
     * @param {AppData} dexter Container for all data used in this workflow.
     */
    run: function(step, dexter) {
        var auth = this.authParams(dexter);
        // check params.
        if (!this.checkCorrectParams(auth, step)) return;

        var requestId = step.input('id').first(),
            owner = step.input('owner').first().trim(),
            repo_slug = step.input('repo_slug').first().trim();

        var uriLink = 'repositories/' + owner + '/' + repo_slug + '/pullrequests/' + requestId + '/approve';
        //send API request
        request.post({url: uriLink, auth: auth, json: true}, function (error, responce, body) {

            this.processResult(error, responce, body);
        }.bind(this));
    }
};
