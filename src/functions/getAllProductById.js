const { app } = require('@azure/functions');
const { connectionString, connectionOptions, mongoose } = require('../../dbConnection');

// Define the product schema
const productSchema = new mongoose.Schema({
    productName: String,
    productPrice: Number,
    productImage: String,
    productDescription: String
});

// Check if the Product model is already defined
const Product = mongoose.models.Product || mongoose.model('Product', productSchema);

app.http('getAllProductById', {
    methods: ['POST'],
    authLevel: 'anonymous',
    handler: async (request, context) => {
        context.log(`HTTP function processed request for URL "${request.url}"`);

        // Get the product ID from the query parameters
        const productId = request.query.get('id');

        if (!productId) {
            return {
                status: 400,
                body: "Product ID is required"
            };
        }

        try {
            // Connect to the database
            await mongoose.connect(connectionString, connectionOptions);
            context.log('Connected to MongoDB');

            const product = await Product.findById(productId);

            if (!product) {
                return {
                    status: 404,
                    body: "Product not found"
                };
            }

            return {
                status: 200,
                body: product
            };
        } catch (error) {
            context.log.error("Error retrieving product", error);
            return {
                status: 500,
                body: "Internal server error"
            };
        } finally {
            // Close the connection after the request is handled
            await mongoose.connection.close();
            context.log('Disconnected from MongoDB');
        }
    }
});
