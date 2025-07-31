import mongoose from "mongoose";
import Categoria from "./categoria.model.js"

const contenidoSchema = new mongoose.Schema({
    subtitulo: {
        type: String
    },
    parrafo: {
        type: String
    },
    imagen: {
        type: String,
        default: null
    }
})

const programaSchema = new mongoose.Schema({
    titulo: {
        type: String
    },
    abreviatura: {
        type: String
    },
    categoria_id: {
        type: mongoose.Schema.Types.ObjectId, 
        ref: "Categoria",
        required: false
    },
    descripcion: {
        type: String
    },
    color: {
        type: String
    },
    indicePortada: {
        type: String,
        default: "1"
    },
    imagenesEnlace: {
        type: [String]
    },
    enlace: {
        type: String
    },
    contenido:{
        type: [contenidoSchema],
    },
    imagenes: {
        type: [String],
    }
},
    {
        timestamps: true
    }
)


const Programa = mongoose.model('Programa', programaSchema);
const Contenido = mongoose.model('Contenido', contenidoSchema);

export { Programa, Contenido };