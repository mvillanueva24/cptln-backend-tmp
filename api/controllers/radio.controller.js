import { Radio, SeccionRadio, ContenidoSeccionRadio } from "../models/radio.model.js";
import { upload, getFileURL, deleteFile } from "../aws/s3.js";
import mongoose from "mongoose";

// Formatos de video
const videoFormats = [
    ".mp4", ".avi", ".mkv", ".mov", ".wmv",
    ".flv", ".webm", ".mpeg", ".mpg", ".3gp", ".m4v"
];

// Formatos de audio
const audioFormats = [
    ".mp3", ".wav", ".flac", ".aac", ".ogg",
    ".wma", ".m4a", ".alac"
];

// Formatos de imagen
const imageFormats = [
    ".jpg", ".jpeg", ".png", ".gif", ".bmp",
    ".tiff", ".svg", ".webp", ".heic", ".ico"
];

// METHOD DE RADIO
const crearRadio = async (req, res) => {
    try {
        const { nombre, descripcion } = req.body
        const newRadio = new Radio({
            nombre: nombre,
            descripcion: descripcion,
        })
        if (req.files) {
            if (req.files && req.files.video) {
                const { video } = req.files
                const ruta = `radio/${newRadio._id}/config/${video.name}`
                await upload(video, ruta)
                newRadio.videoHome = ruta
            }
            if (req.files && req.files.imagenesExtra) {
                const { imagenes } = req.files
                for (const imagen of Array.isArray(imagenes) ? imagenes : [imagenes]) {
                    const ruta = `radio/${newRadio._id}/config/${imagen.name}`
                    await upload(imagen, ruta)
                    newRadio.imagenes.push(ruta)
                }
            }
        }
        await newRadio.save()
        return newRadio
    } catch (error) {
        console.log(error);
        return res.status(500).send('Ocurrio un error')
    }
}

export const obtenerDatosRadio = async (req, res) => {
    try {
        const radio = await Radio.findOne()
        if (!radio) return res.status(404).send('No encontrado');
        if (radio.videoHome) {
            const tmp = radio.videoHome
            radio.videoHome = await getFileURL(tmp)
        }
        if (radio.imagenes) {
            const imagenes = radio.imagenes
            radio.imagenes = []
            for (const imagen of Array.isArray(imagenes) ? imagenes : [imagenes]) {
                const ruta = await getFileURL(imagen)
                radio.imagenes.push(ruta)
            }
        }
        return res.status(200).send(radio)
    } catch (error) {
        console.log(error);
        return res.status(500).send('Ocurrio un error')
    }
}

export const actualizarDatosRadio = async (req, res) => {
    try {
        const { id, nombre, descripcion } = req.body
        if (id == null) {
            const radio = await crearRadio(req)
            return res.status(200).send(radio)
        }
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(200).send(false);
        }
        const radio = await Radio.findById(id)
        if (!radio) return res.status(404).send('No encontrado');
        if (nombre != undefined) {
            radio.nombre = nombre
        }
        if (descripcion != undefined) {
            radio.descripcion = descripcion
        }
        if (req.files) {
            if (req.files && req.files.imagenes) {
                try {
                    const { imagenes } = req.files
                    const imagenesTMP = radio.imagenes
                    for (const imagen of Array.isArray(imagenesTMP) ? imagenesTMP : [imagenesTMP]) {
                        await deleteFile(imagen)
                    }
                    radio.imagenes = []
                    for (const imagen of Array.isArray(imagenes) ? imagenes : [imagenes]) {
                        const ruta = `radio/${radio._id}/config/${imagen.name}`
                        await upload(imagen, ruta)
                        radio.imagenes.push(ruta)
                    }
                } catch (error) {
                    console.log(error);
                    return res.status(500).send('Error al modificar las imagenes');
                }
            }
            if (req.files && req.files.video) {
                try {
                    if (req.files && req.files.video) {
                        await deleteFile(radio.videoHome)
                        const { video } = req.files
                        const ruta = `radio/${radio._id}/config/${video.name}`
                        await upload(video, ruta)
                        radio.videoHome = ruta
                    }
                } catch (error) {
                    console.log(error);
                    return res.status(500).send('Error en guardar el video')
                }
            }
        }
        await radio.save()
        return res.status(200).send('Cambios guardados correctamente')
    } catch (error) {
        console.log(error);
        return res.status(500).send('Ocurrio un error')
    }
}


// METHOD PARA LAS SECCIONES DE LA RADIO

export const obtenerSecciones = async (req, res) => {
    try {
        const radio = await Radio.findOne()
        const secciones = radio.secciones
        if (!secciones) return res.status(400).send('Aun no hay secciones');
        return res.status(200).send(secciones)
    } catch (error) {
        console.log(error);
        return res.status(500).send('Ocurrio un error')
    }

}

export const obtenerSeccion = async (req, res) => {
    try {
        const radio = await Radio.findOne()
        const { idseccion } = req.params
        const seccionFound = radio.secciones.find((seccion) => seccion._id.toString() === idseccion)
        return res.status(200).send(seccionFound)
    } catch (error) {
        console.log(error);
        return res.status(500).send('Ocurrio un error')
    }
}

export const obtenerSeccionPagination = async (req, res) => {
    try {
        const { idseccion } = req.params
        const radio = await Radio.findOne()
        const page = parseInt(req.query.page) || 1
        const limit = parseInt(req.query.limit) || 2
        const seccionFound = radio.secciones.find((seccion) => seccion._id.toString() === idseccion)
        // const seccion = JSON.parse(JSON.stringify(seccionFound))
        const contenidos = seccionFound.contenidos.slice((page - 1) * limit, (page * limit))
        const totalContenido = seccionFound.contenidos.length
        if (contenidos.length == 0) return res.status(400).send('Aun no hay capitulos');
        const contenidosJson = JSON.parse(JSON.stringify(contenidos))
        for (let index = 0; contenidos.length > index; index++) {
            contenidosJson[index].archivos = []
            if (contenidosJson[index].imagenes && contenidosJson[index].imagenes.length > 0) {
                for (const imagen of contenidosJson[index].imagenes) {
                    const ruta = await getFileURL(imagen)
                    contenidosJson[index].archivos.push({
                        type: 'image',
                        ruta: ruta,
                        originalPath: imagen
                    })
                }
            }

            // Procesar audios
            if (contenidosJson[index].audios && contenidosJson[index].audios.length > 0) {
                for (const audio of contenidosJson[index].audios) {
                    const ruta = await getFileURL(audio)
                    contenidosJson[index].archivos.push({
                        type: 'audio',
                        ruta: ruta,
                        originalPath: audio
                    })
                }
            }

            // Procesar videos
            if (contenidosJson[index].videos && contenidosJson[index].videos.length > 0) {
                for (const video of contenidosJson[index].videos) {
                    const ruta = await getFileURL(video)
                    contenidosJson[index].archivos.push({
                        type: 'video',
                        ruta: ruta,
                        originalPath: video
                    })
                }
            }
        }
        return res.status(200).json({
            'seccion': seccionFound.nombre,
            contenidosJson,
            currentPage: page,
            totalPages: Math.ceil(totalContenido / limit),
            totalContenido,
        })
    } catch (error) {
        console.log(error);
        return res.status(500).send('Ocurrio un error')
    }
}

export const agregarSeccion = async (req, res) => {
    try {
        const radio = await Radio.findOne()
        const { nombre } = req.body
        const newSeccion = new SeccionRadio({
            nombre: nombre
        })
        radio.secciones.push(newSeccion)
        await radio.save()
        return res.status(200).send('OK')
    } catch (error) {
        console.log(error);
        return res.status(500).send('Ocurrio un error')
    }
}

export const modificarSeccion = async (req, res) => {
    try {
        const radio = await Radio.findOne()
        const { nombre } = req.body
        const { idseccion } = req.params
        try {
            const seccionFound = radio.secciones.find((seccion) => seccion._id.toString() === idseccion)
            if (nombre) seccionFound.nombre = nombre;
        } catch (error) {
            return res.status(304).send(error)
        }
        await radio.save()
        return res.status(200).send('OK')
    } catch (error) {
        console.log(error);
        return res.status(500).send('Ocurrio un error')
    }
}

export const eliminarSeccion = async (req, res) => {
    try {
        const radio = await Radio.findOne()
        const { idseccion } = req.body
        const indexSeccion = radio.secciones.findIndex((seccion) => seccion._id.toString() === idseccion)
        radio.secciones.splice(indexSeccion, 1)
        await radio.save()
        return res.status(200).send('Eliminado correctamente')
    } catch (error) {
        console.log(error);
        return res.status(500).send('Ocurrio un error')
    }
}

// METHOD PARA EL CONTENIDO
export const obtenerContenidos = async (req, res) => {
    const radio = await Radio.findOne()
    const { idseccion } = req.params
    try {
        const seccionFound = radio.secciones.find((seccion) => seccion.id.toString() === idseccion)
        let contenidos = seccionFound.contenidos
        contenidos = contenidos.sort((a, b) => {
            const fechaA = new Date(a.fecha || a.createdAt); // Asegúrate de que el campo sea el correcto
            const fechaB = new Date(b.fecha || b.createdAt); // Asegúrate de que el campo sea el correcto
            return fechaB - fechaA; // Ordena de más reciente a más antiguo
        })
        return res.status(200).send(contenidos)
    } catch (error) {
        console.log(error);
        return res.status(500).send('Ocurrio un error')
    }
}

export const obtenerContenido = async (req, res) => {
    const radio = await Radio.findOne()
    const { idseccion, idcontenido } = req.params
    try {
        const seccionFound = radio.secciones.find((seccion) => seccion.id.toString() === idseccion)
        const contenidoSeccionFound = seccionFound.contenidos.find((contenido) => contenido._id.toString() === idcontenido)
        if (!contenidoSeccionFound) return res.status(404).send('No encontrado');
        return res.status(200).send(contenidoSeccionFound)
    } catch (error) {
        console.log(error);
        return res.status(500).send('Ocurrio un error')
    }
}


export const agregarContenido = async (req, res) => {
    const radio = await Radio.findOne()
    const { idseccion } = req.params
    const { descripcion } = req.body
    try {
        const seccionFound = radio.secciones.find((seccion) => seccion.id.toString() === idseccion)
        if (!seccionFound) return res.status(404).send('No encontrado');
        const newContenido = new ContenidoSeccionRadio({
            descripcion: descripcion
        })
        if (req.files) {
            if (req.files && req.files.media) {
                const { media } = req.files
                newContenido.videos = []
                newContenido.audios = []
                newContenido.imagenes = []
                let count = 0
                for (const file of Array.isArray(media) ? media : [media]) {
                    const formato = file.name.split('.').pop().toLowerCase();
                    const verificarFormato = (
                        videoFormats.includes(`.${formato}`) ||
                        audioFormats.includes(`.${formato}`) ||
                        imageFormats.includes(`.${formato}`)
                    )
                    if (!verificarFormato) return res.status(500).send('Formato no valido');
                    if (videoFormats.includes(`.${formato}`)) {
                        const ruta = `radio/${radio._id}/${seccionFound._id}/videos/${count}/${file.name}`
                        await upload(file, ruta)
                        newContenido.videos.push(ruta)
                    } else if (audioFormats.includes(`.${formato}`)) {
                        const ruta = `radio/${radio._id}/${seccionFound._id}/audios/${count}${file.name}`
                        await upload(file, ruta)
                        newContenido.audios.push(ruta)
                    } else if (imageFormats.includes(`.${formato}`)) {
                        const ruta = `radio/${radio._id}/${seccionFound._id}/imagenes/${count}/${file.name}`
                        await upload(file, ruta)
                        newContenido.imagenes.push(ruta)
                    }
                    count++
                }
            }
        }
        seccionFound.contenidos.push(newContenido)
        await radio.save()
        return res.status(200).send('OK')
    } catch (error) {
        console.log(error);
        return res.status(500).send('Ocurrio un error')
    }
}

export const modificarContenido = async (req, res) => {
    const radio = await Radio.findOne()
    const { idseccion, idcontenido } = req.params
    const { descripcion } = req.body
    try {
        const seccionFound = radio.secciones.find((seccion) => seccion.id.toString() === idseccion)
        const contenidoSeccionFound = seccionFound.contenidos.find((contenido) => contenido._id.toString() === idcontenido)
        if (!contenidoSeccionFound) return res.status(404).send('No encontrado');
        if (descripcion) contenidoSeccionFound.descripcion = descripcion
        if (req.files) {
            if (req.files && req.files.media) {
                const urlsContenido = []
                urlsContenido.push(contenidoSeccionFound.videos)
                urlsContenido.push(contenidoSeccionFound.audios)
                urlsContenido.push(contenidoSeccionFound.imagenes)
                const listaContenido = urlsContenido.flat()
                for (const url of Array.isArray(listaContenido) ? listaContenido : [listaContenido]) {
                    await deleteFile(url)
                }
                const { media } = req.files
                contenidoSeccionFound.videos = []
                contenidoSeccionFound.audios = []
                contenidoSeccionFound.imagenes = []
                let count = 0
                for (const file of Array.isArray(media) ? media : [media]) {
                    const formato = file.name.split('.').pop().toLowerCase();
                    const verificarFormato = (
                        videoFormats.includes(`.${formato}`) ||
                        audioFormats.includes(`.${formato}`) ||
                        imageFormats.includes(`.${formato}`)
                    )
                    if (!verificarFormato) return res.status(500).send('Formato no valido');
                    if (videoFormats.includes(`.${formato}`)) {
                        const ruta = `radio/${radio._id}/${seccionFound._id}/videos/${count}/${file.name}`
                        await upload(file, ruta)
                        contenidoSeccionFound.videos.push(ruta)
                    } else if (audioFormats.includes(`.${formato}`)) {
                        const ruta = `radio/${radio._id}/${seccionFound._id}/audios/${count}/${file.name}`
                        await upload(file, ruta)
                        contenidoSeccionFound.audios.push(ruta)
                    } else if (imageFormats.includes(`.${formato}`)) {
                        const ruta = `radio/${radio._id}/${seccionFound._id}/imagenes/${count}/${file.name}`
                        await upload(file, ruta)
                        contenidoSeccionFound.imagenes.push(ruta)
                    }
                    count++
                }
            }
        }
        await radio.save()
        return res.status(200).send('OK')
    } catch (error) {
        console.log(error);
        return res.status(500).send('Ocurrio un error')
    }
}

export const todasLasSeccionesDeRadio = async (req, res) => {
    const { limit } = req.query

    try {
        const radio = await Radio.findOne()
        // Crear una copia profunda para no modificar el original directamente
        const radioResponse = JSON.parse(JSON.stringify(radio))

        // Procesar cada sección

        for (let i = 0; i < radioResponse.secciones.length; i++) {
            const seccion = radioResponse.secciones[i]
            // Inicializar array de archivos

            const contenidoFecha = seccion.contenidos.sort((a, b) =>
                new Date(b.createdAt) - new Date(a.createdAt)
            ).slice(0, limit)

            seccion.contenidos = contenidoFecha
            // Procesar cada contenido
            for (const contenido of seccion.contenidos) {
                // Procesar imágenes
                contenido.archivos = []
                if (contenido.imagenes && contenido.imagenes.length > 0) {
                    for (const imagen of contenido.imagenes) {
                        const ruta = await getFileURL(imagen)
                        contenido.archivos.push({
                            type: 'image',
                            ruta: ruta,
                            originalPath: imagen
                        })
                    }
                }

                // Procesar audios
                if (contenido.audios && contenido.audios.length > 0) {
                    for (const audio of contenido.audios) {
                        const ruta = await getFileURL(audio)
                        contenido.archivos.push({
                            type: 'audio',
                            ruta: ruta,
                            originalPath: audio
                        })
                    }
                }

                // Procesar videos
                if (contenido.videos && contenido.videos.length > 0) {
                    for (const video of contenido.videos) {
                        const ruta = await getFileURL(video)
                        contenido.archivos.push({
                            type: 'video',
                            ruta: ruta,
                            originalPath: video
                        })
                    }
                }
            }
        }

        return res.status(200).json(radioResponse)
    } catch (error) {
        console.log('Error:', error)
        return res.status(500).send('Ocurrió un error')
    }
}

export const obtenerSeccionCliente = async (req, res) => {
    try {
        const radio = await Radio.findOne()
        const radioResponse = JSON.parse(JSON.stringify(radio))
        const { idseccion } = req.params
        const seccionFound = radioResponse.secciones.find(seccion => seccion._id.toString() === idseccion)
        const contenidos = seccionFound.contenidos

        for (const contenido of Array.isArray(contenidos) ? contenidos : [contenidos]) {
            contenido.archivos = []
            if (contenido.imagenes && contenido.imagenes.length > 0) {
                for (const imagen of contenido.imagenes) {
                    const ruta = await getFileURL(imagen)
                    contenido.archivos.push({
                        type: 'image',
                        ruta: ruta,
                        originalPath: imagen
                    })
                }
            }

            // Procesar audios
            if (contenido.audios && contenido.audios.length > 0) {
                for (const audio of contenido.audios) {
                    const ruta = await getFileURL(audio)
                    contenido.archivos.push({
                        type: 'audio',
                        ruta: ruta,
                        originalPath: audio
                    })
                }
            }

            // Procesar videos
            if (contenido.videos && contenido.videos.length > 0) {
                for (const video of contenido.videos) {
                    const ruta = await getFileURL(video)
                    contenido.archivos.push({
                        type: 'video',
                        ruta: ruta,
                        originalPath: video
                    })
                }
            }
        }
        return res.status(200).json(seccionFound)
    } catch (error) {
        console.log('Error:', error)
        return res.status(500).send('Ocurrió un error')
    }
}

export const eliminarContenido = async (req, res) => {
    try {
        const radio = await Radio.findOne()
        const { idseccion } = req.params
        const { idcontenido } = req.body


        const seccionFound = radio.secciones.find((seccion) => seccion.id.toString() === idseccion)
        const contenidoSeccionFound = seccionFound.contenidos.find((contenido) => contenido._id.toString() === idcontenido)
        if (!contenidoSeccionFound) return res.status(404).send('No encontrado');
        const contenidoSeccionFoundIndex = seccionFound.contenidos.findIndex((contenido) => contenido._id.toString() === idcontenido)
        const urlsContenido = []
        urlsContenido.push(contenidoSeccionFound.videos)
        urlsContenido.push(contenidoSeccionFound.audios)
        urlsContenido.push(contenidoSeccionFound.imagenes)
        const listaContenido = urlsContenido.flat()
        for (const url of Array.isArray(listaContenido) ? listaContenido : [listaContenido]) {
            await deleteFile(url)
        }
        seccionFound.contenidos.splice(contenidoSeccionFoundIndex, 1)
        await radio.save()
        return res.status(200).send('OK')
    } catch (error) {
        console.log('Error:', error)
        return res.status(500).send('Ocurrió un error')
    }
}