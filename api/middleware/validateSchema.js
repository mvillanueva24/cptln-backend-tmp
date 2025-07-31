export const validateSchema = (schema) => async (req, res, next) => {
    try {
        await schema.parseAsync(req.body);
        next();
    } catch (error) {
        console.error('Error de validación:', error);
        
        // Devuelve un mensaje de error claro
        const formattedError = error.errors.map((err) => ({
            path: err.path.join('.'),
            message: err.message,
        }));
        
        return res.status(400).json({ 
            status: 'error',
            errors: formattedError 
        });
    }
};