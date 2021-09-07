// const { VueLoaderPlugin } = require('vue-loader')

module.exports = {
    mode: 'production',
    entry: './lib/index.js',
    output: {
        filename: 'boundle.js',
        publicPath: './dist',
    },
    module: {
        rules: [
            {
                test: /\.m?js$/,
                exclude: /(node_modules|bower_components)/,
                use: {
                    loader: 'babel-loader',
                    options: {
                        presets: ['@babel/preset-env']
                    }
                }
            }
        ]
    }
}