require('dotenv').config();
const packageJson = require('./package.json');
const extensionConfig = require('./extension.js');
 
const { webpackConfigBuilder } = require('@ellucian/experience-extension');
const webpack = require('webpack');
require('dotenv').config();

module.exports = async (env, options) => {
plugins: [
    new webpack.DefinePlugin({
        'process.env.REACT_APP_CONSUMER_KEY': JSON.stringify('process.env.REACT_APP_CONSUMER_KEY'),
        'process.env.REACT_APP_CONSUMER_SECRET': JSON.stringify('process.env.REACT_APP_CONSUMER_KEY'),
    })
]
    // Generate Webpack configuration based on the extension.js file
    // and any optional env flags  ("--env verbose", "--env upload", etc)
    const webpackConfig = await webpackConfigBuilder({
        extensionConfig: extensionConfig,
        extensionVersion: packageJson.version,
        mode: options.mode || 'production',
        verbose: env.verbose || process.env.EXPERIENCE_EXTENSION_VERBOSE || false,
        upload: env.upload || process.env.EXPERIENCE_EXTENSION_UPLOAD || false,
        forceUpload: env.forceUpload || process.env.EXPERIENCE_EXTENSION_FORCE_UPLOAD || false,
        uploadToken: process.env.EXPERIENCE_EXTENSION_UPLOAD_TOKEN,
        liveReload: env.liveReload || false,
        port: process.env.PORT || 8082
    });

    // For advanced scenarios, dynamically modify webpackConfig here.

    return webpackConfig;
};