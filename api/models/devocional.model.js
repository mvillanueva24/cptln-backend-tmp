import mongoose from "mongoose";
const devocionalSchema = new mongoose.Schema({
    titulo: {
        type: String,
    },
    parrafo: {
        type: String,
    },
    versiculo: {
        type: String,
    },
    fecha: {
        type: Date,
        required: true,
        unique: true, // Asegura que la fecha sea única
        validate: {
            validator: async function (fecha) {
                // Si es un nuevo documento o la fecha ha sido modificada
                if (this.isNew || this.isModified('fecha')) {
                    // Normaliza la fecha a UTC medianoche
                    const fechaInicio = new Date(Date.UTC(
                        fecha.getUTCFullYear(),
                        fecha.getUTCMonth(),
                        fecha.getUTCDate(),
                        0, 0, 0, 0
                    ));
                    const fechaFin = new Date(Date.UTC(
                        fecha.getUTCFullYear(),
                        fecha.getUTCMonth(),
                        fecha.getUTCDate(),
                        23, 59, 59, 999
                    ));

                    // Busca si existe algún devocional en el mismo día
                    const existente = await mongoose.models.Devocional.findOne({
                        fecha: {
                            $gte: fechaInicio,
                            $lte: fechaFin
                        },
                        _id: { $ne: this._id } // Excluye el documento actual en caso de actualización
                    });

                    return !existente; // Retorna false si ya existe un devocional para esa fecha
                }
                return true;
            },
            message: 'Ya existe un devocional para esta fecha'
        }
    },
    audioURL: {
        type: String,
    },
    imagenURL: {
        type: String,
    },
    estado: {
        type: Boolean,
        default: true
    }
}, {
    timestamps: true
})

const Devocional = mongoose.model('Devocional', devocionalSchema)
export default Devocional