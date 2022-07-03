/* eslint-disable */

const webpack = require('webpack')
const nodeExternals = require('webpack-node-externals')
const TsconfigPathsPlugin = require('tsconfig-paths-webpack-plugin')
const { RunScriptWebpackPlugin } = require('run-script-webpack-plugin')

module.exports = function (options) {
    return {
        ...options,
        entry: [ 'webpack/hot/poll?250', options.entry ],
        mode: 'development',
        externals: [
            nodeExternals({
                allowlist: [ 'webpack/hot/poll?250' ]
            })
        ],
        resolve: {
            extensions: [ '.tsx', '.ts', '.js' ],
            plugins: [ new TsconfigPathsPlugin() ]
        },
        plugins: [
            ...options.plugins,
            new webpack.HotModuleReplacementPlugin(),
            new webpack.WatchIgnorePlugin({ paths: [ /\.js$/, /\.d\.ts$/ ] }),
            new RunScriptWebpackPlugin({ name: options.output.filename })
        ]
    }
}