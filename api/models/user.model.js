import mongoose from "mongoose";
const userSchema = new mongoose.Schema({
    nombres: {
        type: String,
        required: true,
        trim: true,
    },
    apellidos:{
        type: String,
        require:true,
        trim: true,
    },
    correo: {
        type: String,
        required: true,
        unique:true,
        email:true
    },
    contraseña: {
        type: String,
        required: true,
    }
},{
    timestamps: true
})

export default mongoose.model('User', userSchema)