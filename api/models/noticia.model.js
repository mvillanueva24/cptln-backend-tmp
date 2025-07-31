import mongoose from "mongoose";
import { Programa } from "./programa.model.js";

const NoticiaSchema = new mongoose.Schema({
    titulo: {
        type: String,
    },
    cuerpo: {
        type: String
    },
    fecha: {
        type: String
    },
    portada: {
        type: String
    },
    programa_id: {
        type: mongoose.Schema.Types.ObjectId, 
        ref: "Programa",
        required: false
    },
    imagenes:{
        type: [String]
    },
    estado: {
        type: Boolean,
        default: true
    }
},{
    timestamps: true
})

export default mongoose.model('Noticia', NoticiaSchema)