import { Router } from 'express'
import { categorias, categoriasPagination, buscarCategoriaPorNombre, crearCategoria, buscarCategoria, editarCategoria, eliminarCategoria } from '../controllers/categoria.controller.js'
import { authRequired } from '../middleware/validateToken.js'
const router = Router()

// Cliente
router.get('/categorias', categorias)
router.get('/categorias/:id', buscarCategoria)
router.post('/categorias/nombre', buscarCategoriaPorNombre)


// Administracion
router.get('/admin/categorias', authRequired, categorias)
router.get('/admin/categorias/pagination', authRequired, categoriasPagination)
router.get('/admin/categorias/:id', authRequired, buscarCategoria)
router.post('/admin/categorias', authRequired, crearCategoria)
router.post('/admin/categorias/delete', authRequired, eliminarCategoria)
router.post('/admin/categorias/:id', authRequired, editarCategoria)

// router.get('/admin/categorias', categorias)
// router.get('/admin/categorias/pagination', categoriasPagination)
// router.get('/admin/categorias/:id', buscarCategoria)
// router.post('/admin/categorias', crearCategoria)
// router.post('/admin/categorias/delete', eliminarCategoria)
// router.post('/admin/categorias/:id', editarCategoria)

export default router