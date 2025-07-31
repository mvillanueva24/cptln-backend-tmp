import mongoose from "mongoose";

const ebookSchema = new mongoose.Schema({
    titulo: {
        type: String
    },
    descripcion: {
        type: String
    },
    portada: {
        type: String  
    },
    pdf: {
        type: String,
    },
},
    {
        timestamps: true
    }
)

const Ebook = mongoose.model('Ebook', ebookSchema)

export default Ebook