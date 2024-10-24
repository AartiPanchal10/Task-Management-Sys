const mongoose = require("mongoose");

const taskSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        unique: true,
    },
    description: {
        type: String,
        required: true,
        unique: true,
    },
    complete: {
        type: Boolean,
        default: false,
    },
    assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    assignedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    dueDate: {
        type: Date,
        required: true
    }
}, { timestamps: true });

module.exports = mongoose.model("Task", taskSchema);