import { withStyles } from '@ellucian/react-design-system/core/styles';
import { spacing40 } from '@ellucian/react-design-system/core/styles/tokens';
import { Typography, TextLink } from '@ellucian/react-design-system/core';
import PropTypes from 'prop-types';
import React from 'react';
import { KJUR } from 'jsrsasign';

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

    // const hostName = process.env.REACT_APP_HOST_NAME;
    const consumerKey = process.env.REACT_APP_CONSUMER_KEY;
    const consumerSecret = process.env.REACT_APP_CONSUMER_SECRET;
    const url = 'https://uiw-tstransapp.ad.uiwtx.edu/transact/api/initiate';

    function generateOAuthHeader(url, consumerKey, consumerSecret) {
        const nonce = KJUR.crypto.Util.getRandomHexOfNbytes(16);
        const timestamp = Math.floor(Date.now() / 1000).toString();

        const parameterString = `oauth_consumer_key=${consumerKey}&oauth_nonce=${nonce}&oauth_signature_method=HMAC-SHA1&oauth_timestamp=${timestamp}&oauth_version=1.0`;
        const signatureBaseString = `POST&${encodeURIComponent(url)}&${encodeURIComponent(parameterString)}`;

        const signingKey = `${encodeURIComponent(consumerSecret)}&`;

        const mac = new KJUR.crypto.Mac({ alg: 'HmacSHA1', 'pass': signingKey});
        mac.updateString(signatureBaseString);
        const signature = mac.doFinal();

        const base64Signature = KJUR.hextob64(signature);
        return `OAuth oauth_consumer_key="${consumerKey}", oauth_nonce="${nonce}", oauth_signature_method="HMAC-SHA1", oauth_timestamp="${timestamp}", oauth_signature="${encodeURIComponent(base64Signature)}", oauth_version="1.0"`;
    }

    async function initiateApiCall() {
        const authHeader = generateOAuthHeader(url, consumerKey, consumerSecret);
        try {
            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    'Authorization': authHeader,
                }
            });
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return await response.json();
        } catch (error) {
            console.error('Error making API call: ', error);
        }
    }
    initiateApiCall().then(response => {
        console.log(response);
    });

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