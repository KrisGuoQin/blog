/*
 * @Description: 
 * @Author: GuoQin
 * @Date: 2019-11-07 19:59:59
 * @LastEditors: GuoQin
 * @LastEditTime: 2019-11-07 20:05:56
 */
const merge = require('webpack-merge');
const commonConfig = require('./webpack.common');
const path = require('path');
const webpack = require('webpack');
const copyWebpackPlugin = require('copy-webpack-plugin');
const htmlWebpackPlugin = require('html-webpack-plugin');
const vendor = ['webpack-hot-middleware/client?reload=true', 'react-hot-loader/patch', 'react', 'react-dom']
const distPath = process.cwd()

module.exports = merge(commonConfig, {
    mode: 'development',
    entry: {
        'page1': [...vendor, './src/page1/index.jsx'],
        'page2': [...vendor, './src/page2/index.jsx']
    },
    output: {
        filename: 'static/js/[name].bundle.js',
        chunkFilename: 'static/js/[name].bundle.js',
        path: path.resolve(distPath, 'dist')
    },
    devtool: 'cheap-source-map',
    plugins: [
        new webpack.optimize.OccurrenceOrderPlugin(),
        new webpack.HotModuleReplacementPlugin(),
        new webpack.NoEmitOnErrorsPlugin(),
        new webpack.NamedModulesPlugin(),
        new copyWebpackPlugin([
            {
                from: path.resolve(distPath, 'public'),
                to: path.resolve(distPath, 'dist'),
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
              'page1'
            ]
        }),
        new htmlWebpackPlugin({
            title: 'page2',
            template: 'public/page2.html',
            filename: 'page2.html',
            chunksSortMode: 'dependency',
            chunks: [
              'page2'
            ]
        }),
    ]
})