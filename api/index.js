import app from "./app.js"
import { conectDB } from "./db.js"
import fileUpload from 'express-fileupload'

//Conexion Mongo Atlas
conectDB()

//Iniciar servidor
const PORT = process.env.PORT || 3000
app.listen(PORT, ()=>{
    console.log(`===============================\nConectado al puerto ${PORT} \nRuta: http://localhost:${PORT}\n===============================`)
})

export default app