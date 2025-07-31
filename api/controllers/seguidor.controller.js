import Seguidor from '../models/seguidor.model.js'

export const obtenerSolicitudesOraciones = async(req, res) => {
    const page = parseInt(req.query.page) || 1
    const limit = parseInt(req.query.limit) || 2
    const solicitudes = await Seguidor.find({objetivo: 'oraciones'}).sort().skip((page - 1) * limit).limit(limit)
    const totalSolicitudes = await Seguidor.countDocuments()
    if (solicitudes.length == 0) { return res.status(400).send('Aun no hay eventos') }
    return res.status(200).json({
        solicitudes,
        currentPage: page,
        totalPages: Math.ceil(totalSolicitudes / limit),
        totalSolicitudes
    })
}

export const obtenerSolicitudesEbooks = async(req, res) => {
    const page = parseInt(req.query.page) || 1
    const limit = parseInt(req.query.limit) || 2
    const solicitudes = await Seguidor.find({objetivo: 'ebooks'}).sort().skip((page - 1) * limit).limit(limit)
    const totalSolicitudes = await Seguidor.countDocuments()
    if (solicitudes.length == 0) { return res.status(400).send('Aun no hay eventos') }
    return res.status(200).json({
        solicitudes,
        currentPage: page,
        totalPages: Math.ceil(totalSolicitudes / limit),
        totalSolicitudes
    })
}

export const obtenerSolicitudesCursos = async(req, res) => {
    const page = parseInt(req.query.page) || 1
    const limit = parseInt(req.query.limit) || 2
    const solicitudes = await Seguidor.find({objetivo: 'cursos'}).sort().skip((page - 1) * limit).limit(limit)
    const totalSolicitudes = await Seguidor.countDocuments()
    if (solicitudes.length == 0) { return res.status(400).send('Aun no hay eventos') }
    return res.status(200).json({
        solicitudes,
        currentPage: page,
        totalPages: Math.ceil(totalSolicitudes / limit),
        totalSolicitudes
    })
}

export const obtenerSolicitudesContactanos = async(req, res) => {
    const page = parseInt(req.query.page) || 1
    const limit = parseInt(req.query.limit) || 2
    const solicitudes = await Seguidor.find({objetivo: 'contactanos'}).sort().skip((page - 1) * limit).limit(limit)
    const totalSolicitudes = await Seguidor.countDocuments()
    if (solicitudes.length == 0) { return res.status(400).send('Aun no hay eventos') }
    return res.status(200).json({
        solicitudes,
        currentPage: page,
        totalPages: Math.ceil(totalSolicitudes / limit),
        totalSolicitudes
    })
}


// export const obtenerSolicitudesOraciones = async(req, res) => {
//     const solicitudes = await Seguidor.find({objetivo: 'oraciones'})
//     if(solicitudes.length == 0) return res.status(400).send('Sin solicitudes')
//     return res.status(200).send(solicitudes)
// }

// export const obtenerSolicitudesEbooks = async(req, res) => {
//     const solicitudes = await Seguidor.find({objetivo: 'ebooks'})
//     if(solicitudes.length == 0) return res.status(400).send('Sin solicitudes')
//     return res.status(200).send(solicitudes)
// }

// export const obtenerSolicitudesCursos = async(req, res) => {
//     const solicitudes = await Seguidor.find({objetivo: 'cursos'})
//     if(solicitudes.length == 0) return res.status(400).send('Sin solicitudes')
//     return res.status(200).send(solicitudes)
// }

export const solicitudOracion = async(req, res) => {
    const { nombres, apellidos, correo, mensaje} = req.body
    await new Seguidor({
        nombres: nombres,
        apellidos: apellidos,
        correo: correo,
        mensaje: mensaje,
        objetivo: 'oraciones'
    }).save()
    return res.status(200).send('Enviado correctamente')
}

export const solicitudEbooks = async(req, res) => {
    const { nombres, apellidos, correo, motivo} = req.body
    await new Seguidor({
        nombres: nombres,
        apellidos: apellidos,
        correo: correo,
        objetivo: 'ebooks',
        motivo: motivo
    }).save()
    return res.status(200).send('Enviado correctamente')
}

export const solicitudCursos = async(req, res) => {
    const { nombres, apellidos, correo, motivo} = req.body
    console.log(req.body);
    
    await new Seguidor({
        nombres: nombres,
        apellidos: apellidos,
        correo: correo,
        motivo: motivo,
        objetivo: 'cursos'
    }).save()
    return res.status(200).send('Enviado correctamente')
}

export const solicitudContactanos = async(req, res) => {
    const { nombres, apellidos, mensaje, ciudad, telefono, correo} = req.body
    await new Seguidor({
        nombres: nombres,
        apellidos: apellidos,
        correo: correo,
        mensaje: mensaje,
        telefono: telefono,
        ciudad: ciudad,
        objetivo: 'contactanos'
    }).save()
    return res.status(200).send('Enviado correctamente')
}