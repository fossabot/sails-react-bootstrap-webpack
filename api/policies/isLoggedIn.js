module.exports = async function(req, res, next) {
    const sessionId = req.signedCookies[sails.config.session.name] || null; // signed cookies: https://sailsjs.com/documentation/reference/request-req/req-signed-cookies

    // do we have a signed cookie
    if (sessionId) {
        const foundSession = await sails.models.session.findOne({id: sessionId}).populate('user');

        if (foundSession && foundSession.user) {
            req.session = {id: sessionId, user: foundSession.user};

            if (req.method !== 'GET') {
                const csrf = req.headers['x-csrf-token'];

                // verify the CSRF token is still valid
                if (csrf && sails.helpers.verifyCsrfToken.with({token: csrf, secret: foundSession.data._csrfSecret})) {
                    return next();
                }
            } else {
                return next();
            }
        }

        // Doesn't look like this session is valid, remove the cookie.
        /* istanbul ignore next */
        res.clearCookie(sails.config.session.name, {signed: true, secure: sails.config.session.cookie.secure});
    } else {
        // We couldn't find a session via cookies, let's check headers...
        let token = req.headers['authorization'] || null;

        if (token) {
            if (token.includes('Bearer ')) {
                token = token.substring(7);
            }

            const foundToken = await sails.models.apitoken.findOne({token}).populate('user');

            if (foundToken) {
                await sails.models.apitoken.updateOne({token}).set({updatedAt: new Date()});

                req.session = {id: foundToken.id, user: foundToken.user, isAPIToken: true};

                return next();
            }
        }
    }

    return res.forbidden('You are not logged in');
};
