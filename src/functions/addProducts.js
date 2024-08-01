const { app } = require('@azure/functions');
const mongoose = require('mongoose');

// URL-encoded connection string
const connectionString = "mongodb+srv://Shivam5168:Pradhan%402005@demo2005.mongocluster.cosmos.azure.com/?tls=true&authMechanism=SCRAM-SHA-256&retrywrites=false&maxIdleTimeMS=120000";

mongoose.connect(connectionString, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
});

// The rest of your function...

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
        context.log(`Http function processed request for url "${request.url}"`);

        try {
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

            context.log(`Created product with id: ${createdProduct._id}`);
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
        }
    }
});
