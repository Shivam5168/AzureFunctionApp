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

// Function to get total distinct items in the cart
app.http('getTotalItemsInCart', {
    methods: ['POST'],
    authLevel: 'anonymous',
    handler: async (request, context) => {
        context.log(`HTTP function processed request for URL "${request.url}"`);

        try {
            // Connect to the database
            await mongoose.connect(connectionString, connectionOptions);
            context.log('Connected to MongoDB');

            // Find the cart
            const cart = await Cart.findOne({});

            // Calculate the total distinct products in the cart
            const totalItems = cart && cart.products ? cart.products.length : 0;

            // Log the total items for debugging
            context.log(`Total distinct items in cart: ${totalItems}`);

            return {
                status: 200,
                body: JSON.stringify({ totalItems }), // Explicitly stringify the response
                headers: {
                    'Content-Type': 'application/json', // Ensure the correct content type
                },
            };
        } catch (error) {
            context.log.error("Error retrieving total items in cart", error);
            return {
                status: 500,
                body: "Internal server error",
            };
        } finally {
            // Close the connection after the request is handled
            await mongoose.connection.close();
            context.log('Disconnected from MongoDB');
        }
    }
});
