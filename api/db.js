import mongoose from 'mongoose'
import { config } from 'dotenv'
config()

export const conectDB = async () => {
    try {
        await mongoose.connect(process.env.DATABASE_URL)
        // await mongoose.connect()
        console.log('Conectado a la base de datos')
    } catch (error) {
        console.log(error)
    }
}