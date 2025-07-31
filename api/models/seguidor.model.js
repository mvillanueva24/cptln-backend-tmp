import mongoose from "mongoose";
const seguidorSchema = new mongoose.Schema({
    nombres: {
        type: String,
    },
    apellidos: {
        type: String,
    },
    correo: {
        type: String,
    },
    mensaje: {
        type: String
    },
    telefono: {
        type: String
    },
    ciudad: {
        type: String
    },
    objetivo: {
        type: String
    },
    motivo: {
        type: String
    },
    estado: {
        type: Boolean,
        default: true
    }
},{
    timestamps: true
})

export default mongoose.model('Seguidor', seguidorSchema)