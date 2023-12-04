import { withStyles } from '@ellucian/react-design-system/core/styles';
import { spacing40 } from '@ellucian/react-design-system/core/styles/tokens';
import { Typography, TextLink } from '@ellucian/react-design-system/core';
import PropTypes from 'prop-types';
import React
    // { useEffect, 
    // useState } 
    from 'react';
// import { tokens } from '@ellucian/react-design-system';
// import { consumers } from 'stream';
import fetch from 'node-fetch';
import crypto from 'crypto';

const styles = () => ({
    card: {
        marginTop: 0,
        marginRight: spacing40,
        marginBottom: 0,
        marginLeft: spacing40
    }
});

const TransactCard = (props) => {
    const { classes } = props;
    // const [data, setData] = useState(null);
    // const [error, setError] = useState(null);
    // const [isLoading, setIsLoading] = useState(false);
    // const crypto = require('crypto');
    const hostName = process.env.HOST_NAME;
    // const institutionRouteScheme= process.env.INSTITUTION_ROUTE_SCHEME;
    // const institutionRouteValue = process.env.INSTITUTION_ROUTE_VALUE;
    const consumerKey = process.env.CONSUMER_KEY;
    const consumerSecret = process.env.CONSUMER_SECRET;


    async function makeApiCall(url, method, headers, body = null) {
        try {
            const options = {
                method: method,
                headers: headers,
                body: JSON.stringify(body)
            };
            // Only include body in POST and PUT requests
            if (method === 'GET' || method === 'DELETE') {
                delete options.body;
            }
            const response = await fetch(url, options);

            // Check if response is successful
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            console.error('Error making API call: ', error);
            throw error;
        }
    }

    function generateOAuthHeader(url, method, consumerKey, consumerSecret, token, tokenSecret, additionalParams = {}) {
        // prep OAuth Params
        const oauthParameters = {
            oauth_consumer_key: consumerKey,
            oauth_nonce: crypto.randomBytes(16).toString('hex'),
            oauth_signature_method: 'HMAC_SHA1',
            oauth_timestamp: Math.floor(Date.now() / 1000).toString(),
            oauth_token: token || '',
            oauth_version: 1.0,
            ...additionalParams
        };

        // create signature base string and signing key
        const parameterString = Object.keys({ ...oauthParameters, ...additionalParams })
            .sort()
            .map(key => `${encodeURIComponent(key)}=${encodeURIComponent(oauthParameters[key])}`)
            .join('&');
        const encodedUrl = encodeURIComponent(url);
        const signatureBaseString = `${method.toUpperCase()}&${encodedUrl}&${encodeURIComponent(parameterString)}`;
        const signingKey = `${encodeURIComponent(consumerSecret)}&${encodeURIComponent(tokenSecret || '')}`;
        const signature = crypto.createHmac('sha1', signingKey).update(signatureBaseString).digest('base64');
        oauthParameters.oauth_signature = signature;

        // Construct the Authorization header
        return `OAuth${Object.keys(oauthParameters).map(key => `${encodeURIComponent(key)}='${encodeURIComponent(oauthParameters[key])}'`).join(', ')}`;
    }
    // API calls

    // Step 1
    async function requestTempToken() {
        const url = `https://${hostName}/transact/api/initiate`;
        const authHeader = generateOAuthHeader(url, 'POST', consumerKey, consumerSecret);

        try {
            const response = await makeApiCall(url, 'POST', { Authorization: authHeader });
            return response;
        } catch (error) {
            console.error('Error requesting temporary token: ', error.message);
        }
    }
    // Step 2
    async function requestToken(tempToken, tempTokenSecret) {
        const url = `https://${hostName}/transact/api/token`;
        const authHeader = generateOAuthHeader(url, 'POST', consumerKey, consumerSecret, tempToken, tempTokenSecret);

        try {
            const response = await makeApiCall(url, 'POST', { Authorization: authHeader });
            return response;
        } catch (error) {
            console.error('Error requesting token: ', error.message);
        }
    }
    // Step 3
    async function validateAccessToken(token, tokenSecret) {
        const url = `https://${hostName}/transact/api/verify`;
        const authHeader = generateOAuthHeader(url, 'POST', consumerKey, consumerSecret, token, tokenSecret);

        try {
            const response = await makeApiCall(url, 'POST', { Authorization: authHeader });
            return response;
        } catch (error) {
            console.error('Error validating access token: ', error.message);
        }
    }

    // sequential execution
    async function executeOAuthFlow() {
        try {
            // Step 1: Request temporary token and secret
            const tempCredentials = await requestTempToken(hostName, consumerKey, consumerSecret);

            // Step 2: Request token and secret
            const tokenCredentials = await requestToken(hostName, consumerKey, consumerSecret, tempCredentials.tempToken, tempCredentials.tempTokenSecret);

            // Step3: Validate access token
            await validateAccessToken(hostName, consumerKey, consumerSecret, tokenCredentials.token, tokenCredentials.tokenSecret);
        } catch (error) {
            console.error('Error executing OAuth steps: ', error.message);
        }
    }
    executeOAuthFlow();

    //     useEffect(() => {


    //         const fetchData = async () => {
    //             setIsLoading(true);
    //             try {
    //                 const response = await fetch(`https://${hostName}/BBTS/api/management/v1/customers/0000000000000000000001/storedValueAccounts`);
    //                 if (!response.ok) {
    //                     throw new Error(`HTTP error! status: ${response.status}`);
    //                 }
    //                 const json = await response.json();
    //                 setData(json);
    //             } catch (error) {
    //                 setError(error);
    //             } finally {
    //                 setIsLoading(false);
    //             }
    //         };

    //         fetchData();
    //     }, []);

    return (
        <div className={classes.card}>
            <Typography variant="h2">
                Hello TransactCard World
            </Typography>
            <Typography>
                <span>
                    For sample extensions, visit the Ellucian Developer
                </span>
                <TextLink href="https://github.com/ellucian-developer/experience-extension-sdk-samples" target="_blank">
                    GitHub
                </TextLink>
            </Typography>
        </div>
    );

};
TransactCard.propTypes = {
    classes: PropTypes.object.isRequired
};

export default withStyles(styles)(TransactCard);