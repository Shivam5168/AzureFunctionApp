const { app } = require('@azure/functions');
const { connectionString, connectionOptions, mongoose } = require('../../dbConnection');

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
        context.log(`HTTP function processed request for URL "${request.url}"`);

        try {
            // Connect to the database
            await mongoose.connect(connectionString, connectionOptions);
            context.log('Connected to MongoDB');

            const { _id } = await request.json();

            if (!_id) {
                context.log("Missing required field");
                return { status: 400, body: "Missing required field: _id" };
            }

            // Find the cart
            let cart = await Cart.findOne({});

            if (!cart) {
                context.log("Cart not found");
                return { status: 404, body: "Cart not found" };
            }

            // Log the current cart contents for debugging
            context.log("Current cart contents:", cart.products);

            // Find the product index in the cart
            const productIndex = cart.products.findIndex(product => product._id === _id);

            if (productIndex === -1) {
                context.log(`Product with ID: ${_id} not found in cart`);
                return { status: 404, body: "Product not found in cart" };
            }

            // Remove the product from the cart
            cart.products.splice(productIndex, 1);

            // Save the updated cart
            await cart.save();

            context.log(`Product with ID: ${_id} deleted from cart`);
            return { status: 200, body: "Product deleted from cart" };
        } catch (error) {
            context.log.error("Error deleting product from cart", error);
            return { status: 500, body: "Internal server error" };
        } finally {
            // Close the connection after the request is handled
            await mongoose.connection.close();
            context.log('Disconnected from MongoDB');
        }
    }
});
