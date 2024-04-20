const { default: mongoose } = require("mongoose");

const contactSchema = new mongoose.Schema({
    name: {
        type: String,
    },
    email: {
        type: String,
        required: true,
    },
    message: {
        type: String,
    }
});

// Avoid recreating model if it already exists
const Contact = mongoose.models.Contact || mongoose.model('Contact', contactSchema);

module.exports = Contact;
