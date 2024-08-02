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

app.http('getAllProducts', {
    methods: ['POST'],
    authLevel: 'anonymous',
    handler: async (request, context) => {
        context.log(`HTTP function processed request for URL "${request.url}"`);

        try {
            // Connect to the database
            await mongoose.connect(connectionString, connectionOptions);
            context.log('Connected to MongoDB');

            const products = await Product.find({});
            return {
                status: 200,
                body: products
            };
        } catch (error) {
            context.log.error("Error retrieving products", error);
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
