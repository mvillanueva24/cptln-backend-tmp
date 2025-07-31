import Noticia from '../models/noticia.model.js'
import { upload, getFileURL, deleteFile } from '../aws/s3.js'
import mongoose from 'mongoose'
import { Programa } from '../models/programa.model.js'

export const noticias = async (req, res) => {
    const { limit } = req.query
    try {
        const noticias = await Noticia.find().sort({ fecha: -1 }).limit(limit ? limit : null)
        if (noticias.length == 0) return res.status(400).send('No hay noticias aún')
        for (const noticia of noticias) {
            const tmp = noticia.portada
            noticia.portada = await getFileURL(tmp)
        }
        return res.status(200).send(noticias)
    } catch (error) {
        console.log('Error:', error)
        return res.status(500).send('Ocurrió un error')
    }
}

export const noticiasPagination = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1
        const limit = parseInt(req.query.limit) || 2
        const noticias = await Noticia.find().sort({ fecha: -1 }).skip((page - 1) * limit).limit(limit)
        const totalNoticias = await Noticia.countDocuments()
        if (noticias.length == 0) return res.status(400).send('No hay noticias aún')
        for (const noticia of noticias) {
            const tmp = noticia.portada
            noticia.portada = await getFileURL(tmp)
        }
        return res.status(200).json({
            noticias,
            currentPage: page,
            totalPages: Math.ceil(totalNoticias / limit),
            totalNoticias
        })
    } catch (error) {
        console.log('Error:', error)
        return res.status(500).send('Ocurrió un error')
    }
}

export const crearNoticias = async (req, res) => {
    const { titulo, cuerpo, fecha, programa_id } = req.body
    try {
        const newNoticia = new Noticia({
            titulo: titulo,
            cuerpo: cuerpo,
            fecha: fecha,
            programa_id: programa_id ? programa_id : null
        })
        if (req.files) {
            if (req.files.imagenes) {
                const { imagenes } = req.files
                let count = 0
                for (const imagen of Array.isArray(imagenes) ? imagenes : [imagenes]) {
                    const ruta = `noticias/${newNoticia._id}/imagenes/${count}/${imagen.name}`
                    await upload(imagen, ruta)
                    newNoticia.imagenes.push(ruta)
                }
            }
            if (req.files.portada) {
                const { portada } = req.files
                const ruta = `noticias/${newNoticia._id}/portada/${portada.name}`
                await upload(portada, ruta)
                newNoticia.portada = ruta
            }
        }
        await newNoticia.save()
        res.status(200).send('Noticia creada exitosamente')
    } catch (error) {
        console.log('Error:', error)
        return res.status(500).send('Ocurrió un error')
    }
}

export const buscarNoticias = async (req, res) => {
    const { id } = req.params
    try {
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(200).send(false);
        }
        const NoticiaFound = await Noticia.findById(id)
        if (!NoticiaFound) return res.status(404).send('Noticia no encontrada')
        let filenameImages = []
        const { imagenes, portada } = NoticiaFound
        if (imagenes.length > 0) {
            for (const imagen of imagenes) {
                const urlImagen = await getFileURL(imagen);
                filenameImages.push(urlImagen);
            }
            NoticiaFound.imagenes = filenameImages
        }
        if (portada) {
            const tmp = NoticiaFound.portada
            NoticiaFound.portada = await getFileURL(tmp)
        }
        return res.status(200).send(NoticiaFound)
    } catch (error) {
        console.log('Error:', error)
        return res.status(500).send('Ocurrió un error')
    }
}


export const editarNoticias = async (req, res) => {
    const { id } = req.params
    const { titulo, cuerpo, fecha, programa_id, indexImages } = req.body
    try {
        const NoticiaFound = await Noticia.findById(id)
        if (!NoticiaFound) return res.status(404).send('API: Noticia no encontrada')
        if (req.files) {
            if (req.files && req.files.imagenes) {
                const { imagenes } = req.files
                const imagenesTmp = NoticiaFound.imagenes
                for (const imagen of Array.isArray(imagenesTmp) ? imagenesTmp : [imagenesTmp]) {
                    await deleteFile(imagen)
                }
                let count = 0
                for (const imagen of Array.isArray(imagenes) ? imagenes : [imagenes]) {
                    const ruta = `noticias/${NoticiaFound._id}/imagenes/${count}/${imagen.name}`
                    await upload(imagen, ruta)
                    count++
                }
            }
            if (req.files && req.files.portada) {
                const { portada } = req.files
                await deleteFile(NoticiaFound.portada)
                const tmp = `noticias/${NoticiaFound._id}/portada/${portada.name}`
                await upload(portada, tmp)
            }
        }
        const uploadData = {
            titulo: titulo,
            cuerpo: cuerpo,
            fecha: fecha,
            programa_id: programa_id ? programa_id : null
        }

        await Noticia.findByIdAndUpdate(
            id,
            uploadData,
            { new: true }
        )
        res.status(200).send('Noticia modificada exitosamente')
    } catch (error) {
        console.log(error);
        return res.status(500).send('Ocurrio un error')
    }

}

export const noticiasPorPrograma = async (req, res) => {
    try {
        const { programa_id } = req.query
        const noticiasFound = await Noticia.find({ programa_id: programa_id })
        if (noticiasFound.length === 0) return res.status(400).send('No encontrado');
        for (const noticia of Array.isArray(noticiasFound) ? noticiasFound : [noticiasFound]) {
            if (noticia.imagenes) {
                const imagenes = noticia.imagenes
                noticia.imagenes = []
                for (const imagen of imagenes) {
                    const ruta = await getFileURL(imagen)
                    noticia.imagenes.push(ruta)
                }
            }
            if (noticia.portada) {
                const tmp = noticia.portada
                noticia.portada = await getFileURL(tmp)
            }
        }
        return res.status(200).send(noticiasFound)
    } catch (error) {
        console.log(error);
        return res.status(500).send('Ocurrio un error')
    }
}

export const eliminarNoticias = async (req, res) => {
    const { id } = req.query
    
    try {
        const noticiaFound = await Noticia.findById(id)
        if (!noticiaFound) return res.status(404).send('No encontrado');
        const imagenesTmp = noticiaFound.imagenes
        for (const imagen of Array.isArray(imagenesTmp) ? imagenesTmp : [imagenesTmp]) {
            await deleteFile(imagen)
        }
        await deleteFile(noticiaFound.portada)
        await Noticia.findByIdAndDelete(id)
        return res.status(200).send('Eliminado correctamente')
    } catch (error) {
        console.log(error);
        return res.status(500).send('Ocurrio un error')
    }
}