import { Router } from 'express'
import { noticias, noticiasPagination, crearNoticias, buscarNoticias, editarNoticias, eliminarNoticias, noticiasPorPrograma } from '../controllers/noticia.controller.js'
import { authRequired } from '../middleware/validateToken.js'

const router = Router()

// Cliente
router.get('/noticias',noticias)
router.get('/noticias/pagination',noticiasPagination)
router.get('/noticias/programa',noticiasPorPrograma)
router.get('/noticias/:id',buscarNoticias)


// Administracion
router.get('/admin/noticias', authRequired, noticias)
router.get('/admin/noticias/pagination', authRequired, noticiasPagination)
router.get('/admin/noticias/programa', authRequired, noticiasPorPrograma)
router.get('/admin/noticias/:id', authRequired, buscarNoticias)
router.post('/admin/noticias', authRequired, crearNoticias)
router.post('/admin/noticias/delete', authRequired, eliminarNoticias)
router.post('/admin/noticias/:id', authRequired, editarNoticias)

// router.get('/admin/noticias', noticias)
// router.get('/admin/noticias/pagination', noticiasPagination)
// router.get('/admin/noticias/programa', noticiasPorPrograma)
// router.get('/admin/noticias/:id', buscarNoticias)
// router.post('/admin/noticias', crearNoticias)
// router.post('/admin/noticias/delete', eliminarNoticias)
// router.post('/admin/noticias/:id', editarNoticias)
export default router