import app from "./app.js"
import { conectDB } from "./db.js"
import fileUpload from 'express-fileupload'

//Conexion Mongo Atlas
conectDB()

//Iniciar servidor
app.listen(3000, ()=>{
    console.log(`===============================\nConectado al puerto 3000 \nRuta: http://localhost:3000\n===============================`)
})

export default app