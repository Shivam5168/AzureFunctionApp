const { app } = require('@azure/functions');
const mongoose = require('mongoose');

const connectionString = "mongodb+srv://Shivam5168:Pradhan%402005@demo2005.mongocluster.cosmos.azure.com/?tls=true&authMechanism=SCRAM-SHA-256&retrywrites=false&maxIdleTimeMS=120000";

// Connect to the database if not already connected
mongoose.connect(connectionString, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
});

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
    methods: ['GET'],
    authLevel: 'anonymous',
    handler: async (request, context) => {
        context.log(`Http function processed request for url "${request.url}"`);

        // Get the product ID from the query parameters
        const productId = request.query.get('id');

        if (!productId) {
            return {
                status: 400,
                body: "Product ID is required"
            };
        }

        try {
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
        }
    }
});
