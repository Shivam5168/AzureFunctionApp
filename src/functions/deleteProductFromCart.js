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

// Use the existing model if it exists
const Cart = mongoose.models.Cart || mongoose.model('Cart', cartSchema);

// Function to delete product from cart by ID
app.http('deleteProductFromCartById', {
    methods: ['DELETE'],
    authLevel: 'anonymous',
    handler: async (request, context) => {
        context.log(`Http function processed request for url "${request.url}"`);

        try {
            const { _id } = await request.json();

            if (!_id) {
                context.log("Missing required field");
                return { status: 400, body: "Missing required field: _id" };
            }

            // Find the cart
            let cart = await Cart.findOne({});

            if (!cart) {
                return { status: 404, body: "Cart not found" };
            }

            // Find the product index in the cart
            const productIndex = cart.products.findIndex(product => product._id === _id);

            if (productIndex === -1) {
                return { status: 404, body: "Product not found in cart" };
            }

            // Remove the product from the cart
            cart.products.splice(productIndex, 1);

            // Save the updated cart
            await cart.save();

            context.log(`Product with id: ${_id} deleted from cart`);
            return { status: 200, body: "Product deleted from cart" };
        } catch (error) {
            context.log.error("Error deleting product from cart", error);
            return { status: 500, body: "Internal server error" };
        }
    }
});
