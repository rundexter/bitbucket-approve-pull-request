var util = require('./util.js');

var request = require('request').defaults({
    baseUrl: 'https://api.bitbucket.org/2.0/'
});

var pickInputs = {
        'id': { key: 'id', validate: { req: true } },
        'owner': { key: 'owner', validate: { req: true } },
        'repo_slug': { key: 'repo_slug', validate: { req: true } }
    },
    pickOutputs = {
        'user_uuid': 'user.uuid',
        'role': 'role',
        'user_username': 'user.username',
        'user_display_name': 'user.display_name',
        'user_url': 'user.links.self.href',
        'approved': 'isApproved'
    };
var globalPickResult = {
    'user_uuid': 'user.uuid',
    'role': 'role',
    'user_username': 'user.username',
    'user_display_name': 'user.display_name',
    'user_url': 'user.links.self.href',
    'approved': 'isApproved'
};

module.exports = {
    /**
     * The main entry point for the Dexter module
     *
     * @param {AppStep} step Accessor for the configuration for the step using this module.  Use step.input('{key}') to retrieve input data.
     * @param {AppData} dexter Container for all data used in this workflow.
     */
    run: function(step, dexter) {
        var credentials = dexter.provider('bitbucket').credentials(),
            inputs = util.pickInputs(step, pickInputs),
            validateErrors = util.checkValidateErrors(inputs, pickInputs);
        // check params.
        if (validateErrors) 
            return this.fail(validateErrors);

        var uriLink = 'repositories/' + inputs.owner + '/' + inputs.repo_slug + '/pullrequests/' + inputs.id + '/approve';
        //send API request
        request.post({ 
            uri: uriLink, 
            oauth: credentials,
            json: true
        }, function (error, responce, body) {
            if (error || (body && body.error))
                this.fail(error || body.error);
            else
                this.complete(util.pickOutputs(body, pickOutputs) || {});

        }.bind(this));
    }
};
