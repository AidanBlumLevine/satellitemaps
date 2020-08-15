const path = require('path');

module.exports = {
    entry: './images.js',
    module: {
        rules: [{
            test: /\.tsx?$/,
        },],
    },
    resolve: {
        extensions: [ '.js'],
    },
    output: {
        filename: 'images.js',
        path: path.resolve(__dirname, 'dist'),
    }
};