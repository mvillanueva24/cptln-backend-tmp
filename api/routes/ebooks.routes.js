import { Router } from "express";
import { ebooks, ebooksPagination, guardarPDF, buscarEbook, editarEbook, eliminarEbook } from "../controllers/ebooks.controller.js";
import { authRequired } from "../middleware/validateToken.js";

const router = Router()


// Cliente
router.get('/ebooks', ebooks)

// Administracion
router.get('/admin/ebooks', authRequired, ebooks)
router.get('/admin/ebooks/pagination', authRequired, ebooksPagination)
router.get('/admin/ebooks/:id', authRequired, buscarEbook)
router.post('/admin/ebooks', authRequired, guardarPDF)
router.post('/admin/ebooks/delete', authRequired, eliminarEbook)
router.post('/admin/ebooks/:id', authRequired, editarEbook)

// router.get('/admin/ebooks', ebooks)
// router.get('/admin/ebooks/pagination', ebooksPagination)
// router.get('/admin/ebooks/:id', buscarEbook)
// router.post('/admin/ebooks', guardarPDF)
// router.post('/admin/ebooks/delete', eliminarEbook)
// router.post('/admin/ebooks/:id', editarEbook)

export default router