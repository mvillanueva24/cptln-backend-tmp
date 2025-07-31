import mongoose from "mongoose";
const eventoSchema = new mongoose.Schema({
    titulo: {
        type: String,
    },
    cuerpo: {
        type: String,
    },
    ubicacion: {
        type: String,
    },
    fecha: {
        type: String,
    },
    hora:{
        type: String,
    },
    estado: {
        type: Boolean,
        default: true
    }
},{
    timestamps: true
})

const Evento =  mongoose.model('Evento', eventoSchema)
export default Evento