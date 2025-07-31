import Evento from "../models/evento.model.js"

export const eventos = async (req, res) => {
    const { limit } = req.query
    const eventos = await Evento.find().sort({ fecha: -1 }).limit(limit ? limit : null)
    if (eventos.length == 0) return res.status(400).send('Aun no hay eventos')
    return res.status(200).send(eventos)
}

export const eventosPagination = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1
        const limit = parseInt(req.query.limit) || 2
        const eventos = await Evento.find().sort({ fecha: -1 }).skip((page - 1) * limit).limit(limit)
        const totalEventos = await Evento.countDocuments()
        if (eventos.length == 0) return res.status(400).send('Aun no hay eventos')
        return res.status(200).json({
            eventos,
            currentPage: page,
            totalPages: Math.ceil(totalEventos / limit),
            totalEventos
        })
    } catch (error) {
        console.log(error);
        return res.status(500).send('Ocurrio un error')
    }
}

export const buscarEvento = async (req, res) => {
    const { id } = req.params
    try {
        const eventFound = await Evento.findById(id)
        if (!eventFound) return res.status(404).send('Evento no encontrado');
        return res.status(200).send(eventFound)
    } catch (error) {
        console.log(error);
        return res.status(500).send('Ocurrio un error')
    }

}

export const crearEvento = async (req, res) => {
    const { titulo, cuerpo, fecha, hora, ubicacion } = req.body
    try {
        await new Evento({
            titulo: titulo,
            cuerpo: cuerpo,
            fecha: fecha,
            hora: hora,
            ubicacion: ubicacion
        }).save()
        return res.status(200).send('Evento creado exitosamente')
    } catch (error) {
        console.log(error);
        return res.status(500).send('Ocurrio un error')
    }
}

export const editarEvento = async (req, res) => {
    const { id } = req.params
    const { titulo, cuerpo, fecha, hora, ubicacion } = req.body
    try {
        const EventoFound = await Evento.findByIdAndUpdate(
            id,
            { titulo, cuerpo, fecha, hora, ubicacion },
            { new: true }
        )
        if (!EventoFound) return res.status(404).send('Evento no encontrado')
        return res.status(200).send('OK')
    } catch (error) {
        console.log(error);
        return res.status(200).send('Ocurrio un error')
    }
}

export const eliminarEvento = async (req, res) => {
    const { id } = req.query
    try {
        const eventFound = await Evento.findById(id)
        if (!eventFound) return res.status(404).send('No encontrado');
        await Evento.findByIdAndDelete(id)
        return res.status(200).send('Eliminado exitosamente')
    } catch (error) {
        console.log(error);
        return res.status(200).send('Ocurrio un error')
    }
}