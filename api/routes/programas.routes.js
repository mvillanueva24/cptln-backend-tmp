import { Router } from 'express'
import { 
    programas, 
    programasPagination, 
    buscarPrograma,
    programasPorCategoria, 
    buscarProgramaPorNombre, 
    buscarProgramaConContenido,
    buscarContenidoProgramaPagination, 
    buscarContenidoEspecifoPrograma,
    crearPrograma,
    agregarContenidoPrograma,
    editarPrograma, 
    editarContenidoDePrograma, 
    borrarPrograma, 
    cambiarPosicionDelContenido,
    programasCliente,
    borrarContenido
} from '../controllers/programa.controller.js'
import { authRequired } from '../middleware/validateToken.js'

const router = Router()

// Cliente
router.get('/programa',programas)
router.get('/programa/:id',buscarPrograma)
router.get('/client/programa',programasCliente)
router.post('/programa/categoria', programasPorCategoria)
router.post('/programa/nombre', buscarProgramaPorNombre)
router.post('/programa/nombre/contenido', buscarProgramaConContenido)


// Administracion

// Programa //
router.get('/admin/programa', authRequired, programas)
router.get('/admin/programa/pagination', authRequired, programasPagination)
router.get('/admin/programa/:id', authRequired, buscarPrograma)
router.post('/admin/programa', authRequired, crearPrograma)
router.post('/admin/programa/delete', authRequired, borrarPrograma)
router.post('/admin/programa/editar/:id', authRequired, editarPrograma)

// router.get('/admin/programa', programas)
// router.get('/admin/programa/pagination', programasPagination)
// router.get('/admin/programa/:id', buscarPrograma)
// router.post('/admin/programa', crearPrograma)
// router.post('/admin/programa/delete', borrarPrograma)
// router.post('/admin/programa/editar/:id', editarPrograma)

// Contenido //
router.get('/admin/programa/contenido/pagination/:id', authRequired, buscarContenidoProgramaPagination)
router.get('/admin/programa/contenido/:idprograma/:id', authRequired, buscarContenidoEspecifoPrograma)
router.post('/admin/programa/contenido/ordenar/:id', authRequired, cambiarPosicionDelContenido)
router.post('/admin/programa/contenido/delete', authRequired, borrarContenido)
router.post('/admin/programa/contenido/:id', authRequired, agregarContenidoPrograma)
router.post('/admin/programa/contenido/:idprograma/:id', authRequired, editarContenidoDePrograma)

// router.get('/admin/programa/contenido/pagination/:id', buscarContenidoProgramaPagination)
// router.get('/admin/programa/contenido/:idprograma/:id', buscarContenidoEspecifoPrograma)
// router.post('/admin/programa/contenido/ordenar/:id', cambiarPosicionDelContenido)
// router.post('/admin/programa/contenido/delete', borrarContenido)
// router.post('/admin/programa/contenido/:id', agregarContenidoPrograma)
// router.post('/admin/programa/contenido/:idprograma/:id', editarContenidoDePrograma)

export default router