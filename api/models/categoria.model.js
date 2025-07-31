import mongoose from "mongoose";

const categoriaSchema = new mongoose.Schema({
    nombre: {
        type: String,
        required: true,
        unique: true
    },
    descripcion: {
        type: String
    },
    color: {
        type: String
    },
    indicePortada: {
        type: Number,
        default: 1
    },
    imagenes: {
        type: [String],
    },
    estado: {
        type: Boolean,
        default: true
    }
},
    {
        timestamps: true
    }
)

const Categoria = mongoose.model('Categoria', categoriaSchema)
export default Categoria