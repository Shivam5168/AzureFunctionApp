const { app } = require('@azure/functions');
const mongoose = require('mongoose');

// MongoDB connection string
const connectionString = "mongodb+srv://Shivam5168:Pradhan%402005@demo2005.mongocluster.cosmos.azure.com/?tls=true&authMechanism=SCRAM-SHA-256&retrywrites=false&maxIdleTimeMS=120000";

// Connect to MongoDB
mongoose.connect(connectionString);

// Define the cart schema
const cartSchema = new mongoose.Schema({
    products: [
        {
            _id: String, // Product ID
            quantity: Number, // Quantity of the product in the cart
        },
    ],
});

const Cart = mongoose.model('Cart', cartSchema);

// Function to add product to cart
app.http('addProductInCartById', {
    methods: ['POST'],
    authLevel: 'anonymous',
    handler: async (request, context) => {
        context.log(`Http function processed request for url "${request.url}"`);

        try {
            const { _id, quantity } = await request.json();

            if (!_id || quantity === undefined) {
                context.log("Missing required fields");
                return { status: 400, body: "Missing required fields: _id, quantity" };
            }

            // Find the cart (assumed to be unique or managed by your logic)
            let cart = await Cart.findOne({});

            if (!cart) {
                // Create a new cart if it doesn't exist
                cart = new Cart({ products: [] });
            }

            // Check if the product already exists in the cart
            const existingProductIndex = cart.products.findIndex(p => p._id === _id);

            if (existingProductIndex > -1) {
                // Update the quantity if it already exists
                cart.products[existingProductIndex].quantity += quantity;
            } else {
                // Add new product to the cart
                cart.products.push({ _id, quantity });
            }

            // Save the cart
            await cart.save();

            context.log(`Product added to cart with id: ${_id}`);
            return {
                status: 201,
                body: cart
            };
        } catch (error) {
            context.log.error("Error adding product to cart", error);
            return {
                status: 500,
                body: "Internal server error"
            };
        }
    }
});
