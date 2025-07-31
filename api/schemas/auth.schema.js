import { z } from 'zod'
import User from '../models/user.model.js'

const emailExists = async (correo) => {
    // Aquí llamas a tu base de datos, por ejemplo, un método como User.findOne({ correo });
    // Devuelve true si el correo ya existe, o false si es único.
    return await User.findOne({ correo }) !== null;
};

// Define el esquema de registro con zod
export const RegisterSchema = z.object({
    correo: z
        .string({
            required_error: 'El correo es requerido',
        })
        .email({
            message: 'Correo inválido',
        })
        .refine(async (correo) => {
            // Valida que el correo no esté repetido en la base de datos
            return !(await emailExists(correo));
        }, {
            message: 'El correo ya está registrado',
        }),

    password: z
        .string({
            required_error: 'La contraseña es requerida',
        })
        .min(1, {
            message: 'El password requiere mínimo 1 caracter',
        })
});