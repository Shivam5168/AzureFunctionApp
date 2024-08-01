const { app } = require('@azure/functions');
const mongoose = require('mongoose');

// MongoDB connection string
const connectionString = "mongodb+srv://Shivam5168:Pradhan%402005@demo2005.mongocluster.cosmos.azure.com/?tls=true&authMechanism=SCRAM-SHA-256&retrywrites=false&maxIdleTimeMS=120000";

// Connect to MongoDB
mongoose.connect(connectionString, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
});

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
    methods: ['GET'],
    authLevel: 'anonymous',
    handler: async (request, context) => {
        context.log(`Http function processed request for url "${request.url}"`);

        try {
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
        }
    }
});
