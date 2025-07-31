import { getFileURL, upload, deleteFile } from '../aws/s3.js'
import { Programa, Contenido } from '../models/programa.model.js'
import Categoria from '../models/categoria.model.js'
import Noticia from '../models/noticia.model.js'

// Programas
export const programas = async (req, res) => {
    const { limit } = req.query
    try {
        const programasFound = await Programa.find().limit(limit ? limit : null)
        if (programasFound.length == 0) return res.status(400).send('Sin programas')
        for (const programa of programasFound) {
            if (programa.imagenes) {
                const imagenes = programa.imagenes
                programa.imagenes = []
                for (const imagen of imagenes) {
                    const ruta = await getFileURL(imagen)
                    programa.imagenes.push(ruta)
                }
            }
            if (programa.imagenesEnlace) {
                const imagenes = programa.imagenesEnlace
                programa.imagenes = []
                for (const imagen of imagenes) {
                    const ruta = await getFileURL(imagen)
                    programa.imagenes.push(ruta)
                }
            }
        }
        return res.status(200).send(programasFound)
    } catch (error) {
        console.log(error);
        return res.status(500).send('Ocurrio un error')
    }
}

export const programasPagination = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1
        const limit = parseInt(req.query.limit) || 2
        const programas = await Programa.find().skip((page - 1) * limit).limit(limit)
        const totalProgramas = await Programa.countDocuments()
        if (programas.length == 0) return res.status(400).send('Aun no hay programas')
        return res.status(200).json({
            programas,
            currentPage: page,
            totalPages: Math.ceil(totalProgramas / limit),
            totalProgramas
        })
    } catch (error) {
        console.log(error);
        return res.status(500).send('Ocurrio un error')
    }
}

export const buscarPrograma = async (req, res) => {
    const { id } = req.params
    try {
        const ProgramaFound = await Programa.findById(id)
        if (!ProgramaFound) return res.status(404).send('No encontrado');
        if (ProgramaFound.imagenesEnlace) {
            const imagenes = ProgramaFound.imagenesEnlace
            ProgramaFound.imagenesEnlace = []
            for (const imagen of Array.isArray(imagenes) ? imagenes : [imagenes]) {
                const ruta = await getFileURL(imagen)
                ProgramaFound.imagenesEnlace.push(ruta)
            }
        } else {
            if (ProgramaFound.imagenes) {
                const imagenes = ProgramaFound.imagenes
                ProgramaFound.imagenes = []
                for (const imagen of Array.isArray(imagenes) ? imagenes : [imagenes]) {
                    const ruta = await getFileURL(imagen)
                    ProgramaFound.imagenes.push(ruta)
                }
            }
        }
        return res.status(200).send(ProgramaFound)
    } catch (error) {
        console.log(error);
        return res.status(500).send('Ocurrio un error')
    }
}

export const programasPorCategoria = async (req, res) => {
    const { nombre } = req.body
    const customNombre = nombre.replace(/-/g, ' ');
    try {
        const categoriaFound = await Categoria.findOne({ nombre: { $regex: new RegExp(`^${customNombre.toLowerCase()}$`, "i") } })
        const programasFound = await Programa.find({ categoria_id: categoriaFound._id })
        if (programasFound.length == 0) return res.status(400).send('Sin resultados');

        for (const programa of programasFound) {
            if (programa.imagenes) {
                const imagenes = programa.imagenes
                programa.imagenes = []
                for (const imagen of imagenes) {
                    const ruta = await getFileURL(imagen)
                    programa.imagenes.push(ruta)
                }
            }
            if (programa.imagenesEnlace) {
                const imagenes = programa.imagenesEnlace
                programa.imagenes = []
                for (const imagen of imagenes) {
                    const ruta = await getFileURL(imagen)
                    programa.imagenes.push(ruta)
                }
            }
        }
        return res.status(200).send(programasFound)
    } catch (error) {
        console.log(error);
        return res.status(500).send('Ocurrio un error')
    }
}

export const buscarProgramaPorNombre = async (req, res) => {
    const { nombre } = req.body
    const customNombre = nombre.replace(/-/g, ' ');
    try {
        const ProgramaFound = await Programa.findOne({ titulo: { $regex: new RegExp(`^${customNombre.toLowerCase()}$`, "i") } })
        if (!ProgramaFound) return res.status(404).send('No encontrado');
        if (ProgramaFound.imagenes) {
            const imagenes = ProgramaFound.imagenes
            ProgramaFound.imagenes = []
            for (const imagen of Array.isArray(imagenes) ? imagenes : [imagenes]) {
                const ruta = await getFileURL(imagen)
                ProgramaFound.imagenes.push(ruta)
            }
        }
        if (ProgramaFound.imagenesEnlace) {
            const imagenes = ProgramaFound.imagenesEnlace
            ProgramaFound.imagenes = []
            for (const imagen of Array.isArray(imagenes) ? imagenes : [imagenes]) {
                const ruta = await getFileURL(imagen)
                ProgramaFound.imagenes.push(ruta)
            }
        }
        return res.status(200).send(ProgramaFound)
    } catch (error) {
        console.log(error);
        return res.status(500).send('Ocurrio un error')
    }

}

export const buscarProgramaConContenido = async (req, res) => {
    const { nombre } = req.body
    const customNombre = nombre.replace(/-/g, ' ');
    try {
        const ProgramaFound = await Programa.findOne({ titulo: { $regex: new RegExp(`^${customNombre.toLowerCase()}$`, "i") } })
        if (!ProgramaFound) return res.status(404).send('No encontrado')
        if (ProgramaFound.contenido) {
            const contenidos = ProgramaFound.contenido
            for (const contenido of Array.isArray(contenidos) ? contenidos : [contenidos]) {
                if (contenido.imagen) {
                    const tmp = contenido.imagen
                    contenido.imagen = await getFileURL(tmp)
                }
            }
        }
        return res.status(200).send(ProgramaFound)
    } catch (error) {
        console.log(error);
        return res.status(500).send('Ocurrio un error')
    }

}

export const buscarContenidoProgramaPagination = async (req, res) => {
    const { id } = req.params
    try {
        const page = parseInt(req.query.page) || 1
        const limit = parseInt(req.query.limit) || 2
        const ProgramaFound = await Programa.findById(id)
        const totalContenidoPrograma = ProgramaFound.contenido.length
        if (ProgramaFound.contenido.length == 0) return res.status(400).send('Aun no hay contenido');
        const contenidoPrograma = ProgramaFound.contenido.slice((page - 1), (page - 1 + limit))
        return res.status(200).json({
            contenidoPrograma,
            currentPage: page,
            totalPages: Math.ceil(totalContenidoPrograma / limit),
            totalContenidoPrograma
        })
    } catch (error) {
        console.log(error);
        return res.status(500).send('Ocurrio un error')
    }

}

export const buscarContenidoEspecifoPrograma = async (req, res) => {
    try {
        const { idprograma, id } = req.params
        const ProgramaFound = await Programa.findById(idprograma)
        if (!ProgramaFound) return res.status(404).send('No encontrado');
        const ContenidoFound = ProgramaFound.contenido.find((contenido) => contenido._id.toString() === id)
        if (!ContenidoFound) return res.status(404).send('Contenido no encontrado');
        if (ContenidoFound.imagen) {
            const tmp = ContenidoFound.imagen
            ContenidoFound.imagen = await getFileURL(tmp)
        }
        return res.status(200).send(ContenidoFound)
    } catch (error) {
        console.log(error);
        return res.status(500).send('Ocurrio un error')
    }

}

export const crearPrograma = async (req, res) => {
    const { titulo, categoria_id, color, abreviatura, descripcion, enlace } = req.body
    try {
        const newPrograma = new Programa({
            titulo: titulo,
            color: color,
            descripcion: descripcion,
            abreviatura: abreviatura,
            categoria_id: categoria_id ? categoria_id : null
        })
        if (enlace !== undefined) {
            newPrograma.enlace = enlace
            if (req.files && req.files.imagenesEnlace) {
                const { imagenesEnlace } = req.files
                newPrograma.imagenes = null
                newPrograma.contenido = null
                let count = 0
                for (const imagen of Array.isArray(imagenesEnlace) ? imagenesEnlace : [imagenesEnlace]) {
                    const ruta = `programas/${newPrograma._id}/${count}/${imagen.name}`
                    await upload(imagen, ruta)
                    newPrograma.imagenesEnlace = ruta
                    count++
                }
            }
        } else {
            if (req.files && req.files.imagenes) {
                newPrograma.imagenesEnlace = null
                newPrograma.enlace = null
                const { imagenes } = req.files
                let count = 0
                for (const imagen of Array.isArray(imagenes) ? imagenes : [imagenes]) {
                    const ruta = `programas/${newPrograma._id}/${count}/${imagen.name}`
                    await upload(imagen, ruta)
                    newPrograma.imagenes.push(ruta)
                    count++
                }
            }
        }
        await newPrograma.save()
        return res.status(200).send('OK')
    } catch (error) {
        console.log(error);
        return res.status(500).send('Ocurrio un error')
    }
}

export const agregarContenidoPrograma = async (req, res) => {
    const { id } = req.params
    const { subtitulo, parrafo } = req.body
    try {
        const programaFound = await Programa.findById(id)
        if (!programaFound) return res.status(404).send('No encontrado');
        const newContenido = new Contenido({
            subtitulo: subtitulo,
            parrafo: parrafo
        })
        if (req.files && req.files.imagen) {
            const { imagen } = req.files
            const ruta = `programas/${programaFound._id}/${newContenido._id}/${imagen.name}`
            await upload(imagen, ruta)
            newContenido.imagen = ruta
        }
        programaFound.contenido.push(newContenido)
        await programaFound.save()
        return res.status(200).send('OK')
    } catch (error) {
        console.log(error);
        return res.status(500).send('Ocurrio un error')
    }
}

export const editarPrograma = async (req, res) => {
    const { id } = req.params
    const { titulo, abreviatura, categoria_id, descripcion, color, enlace } = req.body
    try {
        const ProgramaFound = await Programa.findById(id)
        if (!ProgramaFound) return res.status(200).send('No encontrado');
        if (titulo) ProgramaFound.titulo = titulo;
        if (abreviatura) ProgramaFound.abreviatura = abreviatura;
        if (categoria_id) ProgramaFound.categoria_id = categoria_id ? categoria_id : null;
        if (descripcion) ProgramaFound.descripcion = descripcion;
        if (color) ProgramaFound.color = color;
        if (enlace === undefined) {
            ProgramaFound.enlace = null
            if (req.files && req.files.imagenes) {
                const imagenesTmp = ProgramaFound.imagenes
                for (const imagen of Array.isArray(imagenesTmp) ? imagenesTmp : [imagenesTmp]) {
                    await deleteFile(imagen)
                }
                ProgramaFound.imagenes = []
                const { imagenes } = req.files
                ProgramaFound.enlace = null
                ProgramaFound.imagenesEnlace = null
                let count = 0
                for (const imagen of Array.isArray(imagenes) ? imagenes : [imagenes]) {
                    const ruta = `programas/${ProgramaFound._id}/${count}/${imagen.name}`
                    await upload(imagen, ruta)
                    ProgramaFound.imagenes.push(ruta)
                    count++
                }
            }
        } else {
            ProgramaFound.imagenes = []
            if (enlace) ProgramaFound.enlace = enlace;
            if (req.files && req.files.imagenesEnlace) {
                const imagenesTmp = ProgramaFound.imagenesEnlace
                for (const imagen of Array.isArray(imagenesTmp) ? imagenesTmp : [imagenesTmp]) {
                    await deleteFile(imagen)
                }
                ProgramaFound.imagenesEnlace = []
                const { imagenesEnlace } = req.files
                let count = 0
                for (const imagen of Array.isArray(imagenesEnlace) ? imagenesEnlace : [imagenesEnlace]) {
                    const ruta = `programas/${ProgramaFound._id}/${count}/${imagen.name}`
                    await upload(imagen, ruta)
                    ProgramaFound.imagenesEnlace.push(ruta)
                }
            }
        }
        await ProgramaFound.save()
        return res.status(200).send('OK')
    } catch (error) {
        console.log(error);
        return res.status(500).send('Ocurrio un error')
    }
}

export const editarContenidoDePrograma = async (req, res) => {
    const { idprograma, id } = req.params
    const { subtitulo, parrafo } = req.body
    try {
        const ProgramaFound = await Programa.findById(idprograma)
        if (!ProgramaFound) return res.status(404).send('No encontrado');
        const ContenidoFound = ProgramaFound.contenido.find((contenido) => contenido._id.toString() === id)
        if (!ContenidoFound) return res.status(404).send('Contenido no encontrado');
        if (subtitulo) ContenidoFound.subtitulo = subtitulo;
        if (parrafo) ContenidoFound.parrafo = parrafo;
        if (req.files && req.files.imagen) {
            const { imagen } = req.files
            if (ContenidoFound.imagen) {
                await deleteFile(ContenidoFound.imagen)
            }
            const ruta = `programas/${ProgramaFound._id}/${ContenidoFound._id}/${imagen.name}`
            await upload(imagen, ruta)
            ContenidoFound.imagen = ruta
        }
        ProgramaFound.save()
        return res.status(200).send(ContenidoFound)
    } catch (error) {
        console.log(error);
        return res.status(500).send('Ocurrio un error')
    }
}

export const cambiarPosicionDelContenido = async (req, res) => {
    const { id } = req.params
    const { indexSeleccionado, indexInsertar } = req.body
    const ProgramaFound = await Programa.findById(id)
    const newItems = [...ProgramaFound.contenido];
    const [draggedItem] = newItems.splice(indexSeleccionado, 1);
    newItems.splice(indexInsertar, 0, draggedItem)
    ProgramaFound.contenido = newItems
    await ProgramaFound.save()
    return res.status(200).send(newItems)

}

export const borrarPrograma = async (req, res) => {
    const { idprograma } = req.query    
    try {
        const ProgramaFound = await Programa.findById(idprograma)
        if (!ProgramaFound) return res.status(404).json('Programa no encontrado');
        if (ProgramaFound.imagenes){
            const imagenes = ProgramaFound.imagenes
            for (const imagen of Array.isArray(imagenes) ? imagenes : [imagenes]) {
                await deleteFile(imagen)
            }
        }
        const noticiasFound = await Noticia.find({ programa_id: idprograma })
        for (const noticia of Array.isArray(noticiasFound) ? noticiasFound : [noticiasFound]) {
            noticia.programa_id = null
            await noticia.save()
        }
        await Programa.findByIdAndDelete(idprograma)
        return res.status(200).json('Eliminado exitosamente')
    } catch (error) {
        console.log(error);
        return res.status(500).send('Ocurrio un error')
    }
}

export const borrarContenido = async (req, res) => {
    try {
        const { idprograma, idcontenido } = req.body
        const programaFound = await Programa.findById(idprograma)
        if (!programaFound) return res.status(404).send('No encontrado');
        const contenidoFound = programaFound.contenido.find((contenido) => contenido._id.toString() === idcontenido)
        if (!contenidoFound) return res.status(404).send('No encontrado');
        const contenidFoundIndex = programaFound.contenido.findIndex((contenido) => contenido._id.toString() === idcontenido)
        if (contenidoFound.imagen) {
            await deleteFile(contenidoFound.imagen)
        }
        programaFound.contenido.splice(contenidFoundIndex, 1)
        await programaFound.save()
        return res.status(200).send('Eliminado correctamente')
    } catch (error) {
        console.log(error);
        return res.status(500).send('Ocurrio un error')
    }
}


//Cliente
export const programasCliente = async (req, res) => {
    const { limit } = req.query
    try {
        const programasFound = await Programa.find().limit(limit ? limit : null)
        if (programasFound.length == 0) return res.status(400).send('Sin programas');
        const programasFoundJSON = JSON.parse(JSON.stringify(programasFound))
        for (const programa of programasFoundJSON) {
            if (programa.categoria_id) {
                const categoriaFound = await Categoria.findById(programa.categoria_id)
                programa.categoria = categoriaFound.nombre
            }
            if (programa.imagenes) {
                const imagenes = programa.imagenes
                programa.imagenes = []
                for (const imagen of Array.isArray(imagenes) ? imagenes : [imagenes]) {
                    const ruta = await getFileURL(imagen)
                    programa.imagenes.push(ruta)
                }
            }
            if (programa.imagenesEnlace) {
                const imagenes = programa.imagenesEnlace
                programa.imagenes = []
                for (const imagen of Array.isArray(imagenes) ? imagenes : [imagenes]) {
                    const ruta = await getFileURL(imagen)
                    programa.imagenes.push(ruta)
                }
            }
        }
        return res.status(200).send(programasFoundJSON)
    } catch (error) {
        console.log(error);
        return res.status(500).send('Ocurrio un error')
    }
}