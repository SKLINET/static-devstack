const path = require('path');
const fs = require('fs');
const glob = require('glob');
const HTMLWebpackPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const OptimizeCssAssetsPlugin = require('optimize-css-assets-webpack-plugin');
const PurgecssPlugin = require('purgecss-webpack-plugin');
const ManifestPlugin = require('webpack-manifest-plugin');
const FaviconsWebpackPlugin = require('favicons-webpack-plugin');
const StylelintPlugin = require('stylelint-webpack-plugin');
const TerserPlugin = require('terser-webpack-plugin');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');

function generateHtmlPlugins(templateDir) {
    // Read files in template directory
    const templateFiles = fs.readdirSync(path.resolve(__dirname, templateDir));
    return templateFiles.map(item => {
        // Split names and extension
        const parts = item.split('.');
        const name = parts[0];
        const extension = parts[1];
        // Create new HTMLWebpackPlugin with options
        return new HTMLWebpackPlugin({
            filename: `${name}.html`,
            template: path.resolve(
                __dirname,
                `${templateDir}/${name}.${extension}`
            )
        });
    });
}

function getPaths({
    sourceDir = 'frontend',
    buildDir = 'build',
    staticDir = '',
    images = 'img',
    fonts = 'fonts',
    js = 'scripts',
    css = 'styles'
} = {}) {
    const assets = { images, fonts, js, css };

    return Object.keys(assets).reduce(
        (obj, assetName) => {
            const assetPath = assets[assetName];

            obj[assetName] = !staticDir
                ? assetPath
                : `${staticDir}/${assetPath}`;

            return obj;
        },
        {
            app: path.join(__dirname, sourceDir),
            build: path.join(__dirname, buildDir),
            staticDir
        }
    );
}

const htmlPlugins = generateHtmlPlugins('./frontend/pug/views');
const paths = getPaths();
module.exports = {
    context: paths.app,
    entry: `${paths.app}/scripts`,
    output: {
        path: paths.build,
        publicPath: '/',
        chunkFilename: `${paths.js}/[name].[hash:8].js`,
        filename: `${paths.js}/[name].[hash:8].js`
    },
    resolve: {
        unsafeCache: true,
        symlinks: false
    },
    module: {
        noParse: /\.min\.js/,
        rules: [
            {
                test: /\.js$/,
                exclude: /node_modules/,
                include: paths.app,
                use: {
                    loader: 'babel-loader',
                    options: {
                        cacheDirectory: true
                    }
                }
            },
            {
                test: /\.pug$/,
                use: ['html-loader', 'pug-html-loader']
            },
            {
                test: /\.scss$/,
                use: [
                    MiniCssExtractPlugin.loader,
                    // "style-loader", // style nodes from js strings
                    'css-loader',
                    {
                        loader: 'postcss-loader',
                        options: {
                            config: {
                                path: __dirname + '/postcss.config.js'
                            }
                        }
                    },
                    'fast-sass-loader'
                ]
            },
            {
                // Capture eot, ttf, woff, and woff2
                test: /\.(eot|ttf|woff|woff2)(\?v=\d+\.\d+\.\d+)?$/,
                include: paths.app,
                use: {
                    loader: 'file-loader',
                    options: {
                        name: `${paths.fonts}/[name].[hash:8].[ext]`
                    }
                }
            },
            {
                test: /\.(png|jpg|svg)$/,
                include: paths.app,
                use: {
                    loader: 'url-loader',
                    options: {
                        limit: 15000,
                        name: `${paths.images}/[name].[hash:8].[ext]`
                    }
                }
            },
            {
                test: /\.(gif|png|jpe?g|svg)$/i,
                use: {
                    loader: 'image-webpack-loader',
                    options: {
                        gifsicle: {
                            interlaced: false
                        },
                        mozjpeg: {
                            progressive: true
                        },
                        pngquant: {
                            quality: '65-90',
                            speed: 4
                        }
                    }
                }
            }
        ]
    },
    optimization: {
        splitChunks: {
            chunks: 'all'
        },
        runtimeChunk: 'single',
        minimizer: [
            new TerserPlugin({
                terserOptions: {
                    parse: {
                        ecma: 8
                    },
                    compress: {
                        ecma: 5,
                        warnings: false,
                        comparisons: false
                    },
                    mangle: {
                        safari10: true
                    },
                    output: {
                        ecma: 5,
                        comments: false,
                        ascii_only: true
                    }
                },
                parallel: true,
                cache: true
            }),
            new OptimizeCssAssetsPlugin({
                cssProcessor: require('cssnano'),
                cssProcessorPluginOptions: {
                    preset: [
                        'default',
                        { discardComments: { removeAll: true } }
                    ]
                },
                canPrint: true
            })
        ]
    },
    plugins: [
        new StylelintPlugin({
            context: path.resolve(__dirname, `${paths.app}/styles`),
            syntax: 'scss',
            emitErrors: false
        }),
        new MiniCssExtractPlugin({
            // Options similar to the same options in webpackOptions.output
            // both options are optional
            filename: `${paths.css}/[name].[contenthash:8].css`,
            chunkFilename: `${paths.css}/[id].[contenthash:8].css`
        }),
        new PurgecssPlugin({
            paths: glob.sync(`${paths.app}/**/*.+(pug|js)`, { nodir: true }),
            styleExtensions: ['.css', '.scss']
        }),
        new ManifestPlugin(),
        // generates favicons
        new FaviconsWebpackPlugin({
            logo: './img/logo.png',
            // Generate a cache file with control hashes and
            // don't rebuild the favicons until those hashes change
            persistentCache: true
        }),
        new CleanWebpackPlugin()
    ].concat(htmlPlugins),
    devServer: {
        port: 3000,
        open: true,
        hot: true,
        watchOptions: {
            ignored: /node_modules/
        },
        contentBase: path.join(__dirname, 'frontend')
    }
};
