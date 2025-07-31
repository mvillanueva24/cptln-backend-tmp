import Categoria from "../models/categoria.model.js"
import { getFileURL, upload, deleteFile } from '../../api/aws/s3.js'
import { Programa } from '../models/programa.model.js'

export const categorias = async (req, res) => {
    const { limit } = req.query
    try {
        const categorias = await Categoria.find().limit(limit ? limit : null)
        if (!categorias) return res.status(400).send('Sin categorias');
        for (const categoria of categorias) {
            if (categoria.imagenes) {
                const imagenes = categoria.imagenes
                categoria.imagenes = []
                for (const imagen of imagenes) {
                    const tmp = imagen
                    const ruta = await getFileURL(tmp)
                    categoria.imagenes.push(ruta)
                }
            }
        }
        return res.status(200).send(categorias)
    } catch (error) {
        console.log(error);
        return res.status(200).send('Ocurrio un error')
    }

}

export const categoriasPagination = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1
        const limit = parseInt(req.query.limit) || 2
        const categorias = await Categoria.find().skip((page - 1) * limit).limit(limit)
        const totalCategorias = await Categoria.countDocuments()
        if (categorias.length == 0) return res.status(400).send('Aun no hay categorias')
        return res.status(200).json({
            categorias,
            currentPage: page,
            totalPages: Math.ceil(totalCategorias / limit),
            totalCategorias
        })
    } catch (error) {
        console.log(error);
        return res.status(200).send('Ocurrio un error')
    }
}

export const crearCategoria = async (req, res) => {
    const { nombre, descripcion, color } = req.body
    try {
        const newCategoria = new Categoria({
            nombre: nombre,
            descripcion: descripcion,
            color: color
        })
        if (req.files && req.files.imagenes) {
            const { imagenes } = req.files
            let count = 0
            for (const imagen of Array.isArray(imagenes) ? imagenes : [imagenes]) {
                const ruta = `categorias/${newCategoria._id}/${count}/${imagen.name}`
                await upload(imagen, ruta)
                newCategoria.imagenes.push(ruta)
                count++
            }
        }
        await newCategoria.save()
        return res.status(200).send('OK')
    } catch (error) {
        console.log(error);
        return res.status(200).send('Ocurrio un error')
    }

}

export const editarCategoria = async (req, res) => {
    try {
        const { id } = req.params
        const { nombre, descripcion, color, indicePortada } = req.body
        const categoriaFound = await Categoria.findById(id)
        if (!categoriaFound) return res.status(404).send('Categoria no encontrada')
        if (nombre) categoriaFound.nombre = nombre;
        if (descripcion) categoriaFound.descripcion = descripcion;
        if (color) categoriaFound.color = color;
        if (indicePortada) categoriaFound.indicePortada = indicePortada;
        if (req.files && req.files.imagenes) {
            const { imagenes } = req.files
            const imagenesTmp = categoriaFound.imagenes
            for (const imagen of Array.isArray(imagenesTmp) ? imagenesTmp : [imagenesTmp]) {
                await deleteFile(imagen)
            }
            categoriaFound.imagenes = []
            let count = 0
            for (const imagen of Array.isArray(imagenes) ? imagenes : [imagenes]) {
                const ruta = `categorias/${categoriaFound.nombre}/${count}/${imagen.name}`
                await upload(imagen, ruta)
                categoriaFound.imagenes.push(ruta)
                count++
            }
        }
        await categoriaFound.save()
        return res.status(200).send('Modificado correctamente')
    } catch (error) {
        console.log(error);
        return res.status(200).send('Ocurrio un error')
    }
}

export const buscarCategoria = async (req, res) => {
    const { id } = req.params    
    try {
        const categoriaFound = await Categoria.findById(id)        
        if (!categoriaFound) return res.status(404).send('Categoria no encontrada')
        if (categoriaFound.imagenes) {
            const imagenes = categoriaFound.imagenes
            categoriaFound.imagenes = []
            for (const imagen of imagenes) {
                const ruta = await getFileURL(imagen)
                categoriaFound.imagenes.push(ruta)
            }
        }
        return res.status(200).send(categoriaFound)
    } catch (error) {
        console.log(error);
        return res.status(200).send('Ocurrio un error')
    }
}

export const buscarCategoriaPorNombre = async (req, res) => {
    const { nombre } = req.body
    const customNombre = nombre.replace(/-/g, ' ');
    const categoriaFound = await Categoria.find({ nombre: { $regex: new RegExp(`^${customNombre.toLowerCase()}$`, "i") } })
    if (!categoriaFound) { return res.status(404).send('Categoria no encontrada') }
    return res.status(200).send(categoriaFound)
}

export const eliminarCategoria = async (req, res) => {
    const { id } = req.query
    
    try {
        const categoriaFound = await Categoria.findById(id)
        if (!categoriaFound) return res.status(404).send('No encontrado');
        if(categoriaFound.imagenes) {
            const imagenes = categoriaFound.imagenes
            for (const imagen of Array.isArray(imagenes) ? imagenes : [imagenes]){
                await deleteFile(imagen)
            }
        }
        const programas = await Programa.find({ categoria_id: id})
        if (programas.length > 0){
            for (const programa of programas){
                programa.categoria_id = null
                await programa.save()
            }
        }
        await Categoria.findByIdAndDelete(id)
        return res.status(200).send('Eliminado correctamente')
    } catch (error) {
        console.log(error)
        return res.status(500).send('Ocurrio un error')
    }
}