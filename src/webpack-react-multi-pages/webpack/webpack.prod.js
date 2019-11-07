const webpack = require('webpack');
const merge = require('webpack-merge');
const path = require('path');
const config = require('./webpack.common.js');
const copyWebpackPlugin = require('copy-webpack-plugin');
const htmlWebpackPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const AddAssetHtmlPlugin = require('add-asset-html-webpack-plugin');
const vendor = ['react', 'react-dom']
const distPath = process.cwd()

module.exports = merge(config, {
    mode: 'production',
    entry: {
        'page1': [...vendor, './src/page1/index.jsx'],
        'page2': [...vendor, './src/page2/index.jsx']
    },
    output: {
        filename: 'static/js/[name].[hash:8].js',
        chunkFilename: 'static/js/[name].[hash:8].js',
        path: path.resolve(distPath, 'public_html'),
    },
    module: {
        rules: [
            {
                test: /\.styl$/,
                use: [
                    MiniCssExtractPlugin.loader,
                    'css-loader',
                    'postcss-loader',
                    'stylus-loader'
                ]
            }
        ]
    },
    plugins: [
        new webpack.DllReferencePlugin({
            context: path.join(__dirname),
            manifest: require('./dll/manifest.json')
        }),
        new copyWebpackPlugin([
            {
                from: path.resolve(distPath, 'public'),
                to: path.resolve(distPath, 'public_html'),
                ignore: [
                    '.DS_Store'
                ]
            }
        ]),
        new htmlWebpackPlugin({
            title: 'page1',
            template: 'public/page1.html',
            filename: 'page1.html',
            chunksSortMode: 'dependency',
            chunks: [
              'chunk-common',
              'page1'
            ]
        }),
        new htmlWebpackPlugin({
            title: 'page2',
            template: 'public/page2.html',
            filename: 'page2.html',
            chunksSortMode: 'dependency',
            chunks: [
              'chunk-common',
              'page2'
            ]
        }),
        new AddAssetHtmlPlugin({
            filepath: path.resolve(__dirname, 'dll', 'dll.*.js'),
            outputPath: 'static/js',
            publicPath: 'static/js'
        }),
        new MiniCssExtractPlugin({
            filename: 'static/css/[name].[hash:8].css',
            chunkFilename: 'static/css/[name].[hash:8].css'
        })
    ],
    optimization: {
        splitChunks: {
            cacheGroups: {
                common: {
                  name: 'chunk-common',
                  minChunks: 2,
                  priority: -20,
                  chunks: 'initial',
                  reuseExistingChunk: true
                }
            }
        }
    }
})