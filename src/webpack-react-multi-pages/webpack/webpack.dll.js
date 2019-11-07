const path = require('path');
const webpack = require('webpack');
const cleanWebpackPlugin = require('clean-webpack-plugin');

module.exports = {
    mode: 'production',
    name: 'vendor',
    entry: ['react', 'react-dom'], // 需要独立打包的第三方依赖
    output: {
        path: path.join(__dirname, 'dll'),
        filename: 'dll.[hash:8].js',
        library: '[name]_library'
    },
    plugins: [
        new webpack.ProgressPlugin(),
        new cleanWebpackPlugin({
            cleanOnceBeforeBuildPatterns: [
                'manifest.json',
                'dll.*.js'
            ]
        }),
        new webpack.DllPlugin({
            name: '[name]_library',
            path: path.join(__dirname, 'dll', 'manifest.json')
        })
    ]
}