const path = require('path');
const webpack = require('webpack');
const cleanWebpackPlugin = require('clean-webpack-plugin');

const distPath = process.cwd()
const mode = process.env.NODE_ENV
const isDev = mode === 'development'

module.exports = {
    output: {
        publicPath: ''
    },
    plugins: [
        new webpack.ProgressPlugin(),
        new cleanWebpackPlugin(),
        new webpack.ProvidePlugin({
            React: 'react',
            ReactDOM: 'react-dom'
        })
    ],
    resolve: {
        extensions: ['*', '.js', '.jsx'],
        alias:{
            '@': path.join(__dirname, '..', 'src'),
            '@components': path.resolve(distPath, 'src/components')
        },
    },
    module: {
        rules: [
            {
                test: /\.(js|jsx)$/,
                include: [
                    path.resolve(distPath, 'src')
                ],
                use: {
                    loader: 'babel-loader',
                    options: {
                        cacheDirectory: true
                    }
                }
            },
            {
                test: /\.styl$/,
                use: [
                    'style-loader', 
                    'css-loader', 
                    {
                        loader: 'postcss-loader',
                        options: {
                            sourceMap: false
                        }
                    },
                    {
                        loader: 'stylus-loader',
                        options: {
                            sourceMap: false,
                            preferPathResolver: 'webpack'
                        }
                    }
                ]
            },
            {
                test: /\.css$/,
                use: [
                    'style-loader',
                    'css-loader',
                    {
                        loader: 'postcss-loader',
                        options: {
                            sourceMap: false
                        }
                    }
                ]
            },
            {
                test: /\.(png|jpe?g|gif|webp)(\?.*)?$/,
                use: [
                    {
                        loader: 'url-loader',
                        options: {
                            limit: 4096,
                            name: `${ !isDev && '/'}static/img/[name].${ !isDev && '[hash:8]'}.[ext]`
                        }
                    }
                ]
            },
        ]
    }
}