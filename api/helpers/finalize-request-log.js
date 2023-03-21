const stringify = require('json-stringify-safe');

/**
 * Finalize Request Log
 *
 * @function sails.helpers.finalizeRequestLog
 * @param {Object} req The current `req` object.
 * @param {Object} res The current `res` object.
 * @param {Object} body The final body of the response given to the end-user.
 *
 * @returns null
 */
module.exports = {
    friendlyName: 'Finalize Request Log',

    description: 'Used by response handlers to log final responses to requests.',

    inputs: {
        req: {
            type: 'ref',
            description: 'The current incoming request (req).',
            required: true
        },

        res: {
            type: 'ref',
            description: 'The current outgoing response (res).',
            required: true
        },

        body: {
            type: 'ref',
            description: 'The body of the response.',
            required: true
        }
    },

    exits: {
        success: {}
    },

    fn: async (inputs, exits) => {
        if (inputs.req.requestId) {
            const bleep = '*******';
            let out = _.merge({}, inputs.body),
                headers = _.merge({}, inputs.res.getHeaders()); // copy the object

            // Regardless of what our configuration option is set to, NEVER log sensitive info on PRODUCTION!
            if (sails.config.security.requestLogger.logSensitiveData !== true || process.env.NODE_ENV.toUpperCase() === 'PROD' || process.env.NODE_ENV.toUpperCase() === 'PRODUCTION') {
                if (out._csrf) {
                    out._csrf = bleep;
                }

                if (out.token) {
                    out.token = bleep;
                }

                if (out.access_token) {
                    // eslint-disable-next-line camelcase
                    out.access_token = bleep;
                }

                if (out.refresh_token) {
                    // eslint-disable-next-line camelcase
                    out.refresh_token = bleep;
                }
            }

            if (_.isObject(out)) {
                out = stringify(out);
            }

            const time = Number(process.hrtime.bigint() - inputs.req._requestStartTime) / 1000000; // convert the bigint nanoseconds into milliseconds
            const totalTime = time.toFixed(4) + 'ms';

            let log = {
                responseCode: inputs.res.statusCode,
                responseBody: out,
                responseHeaders: stringify(headers),
                responseTime: totalTime
            };

            sails.models.requestlog.update({id: inputs.req.requestId}).set(log).exec((err) => {
                /* istanbul ignore if */
                if (err) {
                    console.error(err);
                }

                return exits.success();
            });
        } else {
            return exits.success();
        }
    }
};

