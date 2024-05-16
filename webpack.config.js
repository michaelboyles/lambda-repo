module.exports = [
    {
        name: 'Server',
        mode: 'production',
        entry: {
            'GET': './src/GET.ts',
            'PUT': './src/PUT.ts'
        },
        output: {
            filename: '[name].js',
            library: {
                type: 'commonjs2'
            }
        },
        target: 'node',
        resolve: {
            extensions: ['.ts', '.tsx', '.js']
        },
        module: {
            rules: [
                {
                    test: /\.ts$/,
                    exclude: /node_modules/,
                    use: [{
                        loader: 'ts-loader'
                    }]
                }
            ]
        },
        externals: ['@aws-sdk/client-s3'],
        optimization: {
            minimize: false
        },
    }
]