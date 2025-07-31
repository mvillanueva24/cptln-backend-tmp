import express from 'express'
import authRoutes from './routes/auth.routes.js'
import devocionalRoutes from './routes/devocional.routes.js'
import eventosRoutes from './routes/eventos.routes.js'
import noticiasRoutes from './routes/noticias.routes.js'
import categoriasRoutes from './routes/categoria.routes.js'
import ebooksRoutes from './routes/ebooks.routes.js'
import programasRoutes from './routes/programas.routes.js'
import solicitudesRoutes from './routes/seguidor.routes.js'
import cursosRoutes from './routes/cursos.routes.js'
import radioRouter from './routes/radio.routes.js'
import cookieParser from 'cookie-parser'
import fileUpload from 'express-fileupload'
import cors from 'cors'

const app = express()


app.use(cors({
    origin: process.env.FRONTEND_URL,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
}));

// app.use(cors())

app.use(fileUpload({
    useTempFiles: true,
    tempFileDir: './tmp'
}))

// Librerias
app.use(express.json())
app.use(cookieParser())

// app.use('/devocional_crear')

//Rutas
app.use('/api', [
    authRoutes,
    devocionalRoutes,
    eventosRoutes,
    noticiasRoutes,
    categoriasRoutes,
    ebooksRoutes,
    programasRoutes,
    solicitudesRoutes,
    cursosRoutes,
    radioRouter
])

export default app