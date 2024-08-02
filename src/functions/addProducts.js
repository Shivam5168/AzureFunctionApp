const { app } = require('@azure/functions');
const { connectionString, connectionOptions, mongoose } = require('../../dbConnection');

const productSchema = new mongoose.Schema({
    productName: { type: String, required: true },
    productPrice: { type: Number, required: true },
    productImage: { type: String, required: true },
    productDescription: { type: String, required: true }
});

const Product = mongoose.model('Product', productSchema);

app.http('addProducts', {
    methods: ['POST'],
    authLevel: 'anonymous',
    handler: async (request, context) => {
        context.log(`HTTP function processed request for URL "${request.url}"`);

        try {
            // Connect to the database
            await mongoose.connect(connectionString, connectionOptions);
            context.log('Connected to MongoDB');

            const productData = await request.json();
            const { productName, productPrice, productImage, productDescription } = productData;

            if (!productName || !productPrice || !productImage || !productDescription) {
                context.log("Missing required product fields");
                return { status: 400, body: "Missing required product fields" };
            }

            const newProduct = new Product({
                productName,
                productPrice,
                productImage,
                productDescription
            });

            const createdProduct = await newProduct.save();
            context.log(`Created product with ID: ${createdProduct._id}`);

            return {
                status: 201,
                body: createdProduct
            };
        } catch (error) {
            context.log.error("Error creating product", error);
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
