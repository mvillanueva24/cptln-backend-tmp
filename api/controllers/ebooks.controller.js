import Ebook from '../models/ebooks.model.js'
import { deleteFile, getFileURL, upload } from "../aws/s3.js"

export const ebooks = async (req, res) => {
    const { limit } = req.query
    try {
        const ebooks = await Ebook.find().limit(limit ? limit : null)
        if (ebooks.length == 0) return res.status(400).send('Sin libros aun');
        for (const ebook of ebooks) {
            if (ebook.portada) {
                let tmp = ebook.portada
                ebook.portada = await getFileURL(tmp)
            }
            if (ebook.pdf) {
                const tmp = ebook.pdf
                ebook.pdf = await getFileURL(tmp)
            }
        }
        return res.status(200).send(ebooks)
    } catch (error) {
        console.log(error);
        return res.status(500).send('Ocurrio un error')
    }
}

export const ebooksPagination = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1
        const limit = parseInt(req.query.limit) || 2
        const ebooks = await Ebook.find().skip((page - 1) * limit).limit(limit)
        const totalEbooks = await Ebook.countDocuments()
        if (ebooks.length == 0) return res.status(400).send('Aun no hay libros')
        return res.status(200).json({
            ebooks,
            currentPage: page,
            totalPages: Math.ceil(totalEbooks / limit),
            totalEbooks
        })
    } catch (error) {
        console.log(error);
        return res.status(500).send('Ocurrio un error')
    }

}

export const guardarPDF = async (req, res) => {
    const { titulo, descripcion } = req.body
    if (!req.files) return res.status(400).send('No se recibio un archivo');
    try {
        const newEbook = new Ebook({
            titulo: titulo,
            descripcion: descripcion
        })
        if (req.files) {
            const { pdf, portada } = req.files
            if (req.files && req.files.pdf) {
                newEbook.pdf = `ebooks/${newEbook._id}/pdf/${pdf.name}`
                await upload(pdf, newEbook.pdf, 'application/pdf')
            }
            if (req.files && req.files.portada) {
                newEbook.portada = `ebooks/${newEbook._id}/portada/${portada.name}`
                await upload(portada, newEbook.portada)
            }
        }
        await newEbook.save()
        return res.status(200).send('OK')
    } catch (error) {
        console.log(error);
        return res.status(500).send('Ocurrio un error')
    }
}

export const buscarEbook = async (req, res) => {
    const { id } = req.params
    try {
        const ebookFound = await Ebook.findById(id)
        if (!ebookFound) return res.status(404).send('No encontrado');
        if (ebookFound.portada) {
            let tmp = ebookFound.portada
            ebookFound.portada = await getFileURL(tmp)
        }
        if (ebookFound.pdf) {
            let tmp = ebookFound.pdf
            ebookFound.pdf = await getFileURL(tmp)
        }
        return res.status(200).send(ebookFound)
    } catch (error) {
        console.log(error);
        return res.status(500).send('Ocurrio un error')
    }
}

export const editarEbook = async (req, res) => {
    const { id } = req.params
    const { titulo, descripcion } = req.body
    try {
        const ebookFound = await Ebook.findById(id)
        if (!ebookFound) return res.status(404).send('Ebook no encontrado');
        if (titulo) ebookFound.titulo = titulo;
        if (descripcion) ebookFound.descripcion = descripcion;
        if (req.files) {
            if (req.files && req.files.pdf) {
                await deleteFile(ebookFound.pdf)
                const { pdf } = req.files
                ebookFound.pdf = `ebooks/${ebookFound._id}/${pdf.name}`
                await upload(pdf, ebookFound.pdf)
            }
            if (req.files && req.files.portada) {
                await deleteFile(ebookFound.portada)
                const { portada } = req.files
                ebookFound.portada = `ebooks/${ebookFound._id}/${portada.name}`
                await upload(portada, ebookFound.portada)
            }
        }
        await ebookFound.save()
        return res.status(200).send('OK')
    } catch (error) {
        console.log(error);
        return res.status(500).send('Ocurrio un error')
    }
}

export const eliminarEbook = async (req, res) => {
    const { id } = req.query
    try {
        const ebookFound = await Ebook.findById(id)
        if (!ebookFound) return res.status(404).send('No encontrado');
        await deleteFile(ebookFound.pdf)
        await deleteFile(ebookFound.portada)
        await Ebook.findByIdAndDelete(id)
        return res.status(200).send('Eliminado correctamente')
    } catch (error) {
        console.log(error);
        return res.status(500).send('Ocurrio un error')
    }
}