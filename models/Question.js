const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const slugify =require('slugify');

const QuestionSchema = new Schema({

title: {
    type: String,
    required: [true, "Please provie a title"],
    minlength: [10, "Please provide a title at least 10 characters"],
    unique: true

    // title "bu bir sordur ise", bunu linke yansıtacak slug alanı olur aşağıda
},

slug: String,

content: {
    type: String,
    required: [true, "Please provie a content"],
    minlength: [20, "Please provide a title at least 20 characters"],
},

createsAt: {
    type: Date,
    default: Date.now
},

user: {
    type: mongoose.Schema.ObjectId,
    required: true,
    ref: "User"
},

likes: [
    {
        type: mongoose.Schema.ObjectId,
        ref: "User"
    }
]
});


QuestionSchema.pre("save",function(next){ 

    if(!this.isModified("title")){
        next();
      //  console.log("Title not modified!")
    };
    this.slug = this.makeSlug();
    next();

});
QuestionSchema.methods.makeSlug = function(){  // adds the title to the link

    return slugify(this.title, {
        replacement: '-',  // replace spaces with replacement character, defaults to `-`
        remove: /[*+~.()'"!:@]/g, // remove characters that match regex, defaults to `undefined`
        lower: true      // convert to lower case, defaults to `false`
      })
};
module.exports = mongoose.model("Question",QuestionSchema);