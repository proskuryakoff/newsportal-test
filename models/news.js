var mongoose = require("mongoose");

var newsSchema = new mongoose.Schema({
    title: String,
    type: String,
    image: String, 
    body: String, 
    created: {
        type: Date,
        default: Date.now
    },
    counter: Number,
    comments: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "comments"
        }
    ]
});

module.exports = mongoose.model("news", newsSchema);