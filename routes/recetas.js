const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { ValidationError, DatabaseError } = require('sequelize');

// IMPORTANTE: Ajusta estas importaciones según tu estructura
let RecetaModel, sequelize, Receta;

try {
  RecetaModel = require('../models/Recetas');
  sequelize = require('../config/db'); // Ajusta según tu estructura
  Receta = RecetaModel(sequelize);
  
  // Verificar que el modelo esté disponible
  if (!Receta) {
    console.error('ERROR: No se pudo inicializar el modelo Receta');
  }
} catch (error) {
  console.error('ERROR al cargar modelo Receta:', error);
  console.error('Asegúrate de que las rutas de importación sean correctas');
}

// Configuración de multer para subir imágenes
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadPath = path.join(__dirname, '../uploads/recetas');
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    cb(null, uploadPath);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, 'receta-' + uniqueSuffix + ext);
  }
});

const fileFilter = (req, file, cb) => {
  if (file.mimetype === 'image/jpeg' || file.mimetype === 'image/png' || file.mimetype === 'image/jpg') {
    cb(null, true);
  } else {
    cb(new Error('Solo se permiten archivos JPG y PNG'), false);
  }
};

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB
  },
  fileFilter: fileFilter
});

// Middleware para manejar errores de Multer específicamente
const handleMulterError = (req, res, next) => {
  upload.single('imagen')(req, res, (err) => {
    if (err) {
      if (err instanceof multer.MulterError) {
        if (err.code === 'LIMIT_FILE_SIZE') {
          return res.status(400).json({
            success: false,
            error: 'El archivo es demasiado grande. Máximo 5MB'
          });
        }
        return res.status(400).json({
          success: false,
          error: 'Error al subir archivo: ' + err.message
        });
      }
      // Otros errores de archivo (ej. fileFilter)
      return res.status(400).json({
        success: false,
        error: err.message || 'Error al procesar el archivo'
      });
    }
    next();
  });
};

// Ruta para servir imágenes de recetas directamente
router.get('/imagen/:filename', (req, res) => {
  const filename = req.params.filename;
  const imagePath = path.resolve(__dirname, '../uploads/recetas', filename);

  console.log('Intentando servir imagen:', {
    filename,
    imagePath,
    exists: fs.existsSync(imagePath)
  });

  if (fs.existsSync(imagePath)) {
    res.sendFile(imagePath, (err) => {
      if (err) {
        console.error('Error al enviar archivo:', err);
        res.status(500).json({
          success: false,
          error: 'Error al servir la imagen'
        });
      }
    });
  } else {
    console.error('Imagen no encontrada en:', imagePath);
    res.status(404).json({
      success: false,
      error: 'Imagen no encontrada',
      path: imagePath
    });
  }
});

/**
 * GET /api/recetas/publicadas
 * Obtener solo recetas publicadas (DEBE ir antes de /:id)
 */
router.get('/publicadas', async (req, res) => {
  try {
    const { page = 1, limit = 10, categoria } = req.query;
    const offset = (page - 1) * limit;
    const where = {};
    
    if (categoria) where.categoria = categoria;

    const recetas = await Receta.findAndCountAll({
      where,
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['id', 'DESC']] // Usar id porque no hay fecha_envio
    });

    res.json({
      success: true,
      recetas: recetas.rows,
      total: recetas.count,
      page: parseInt(page),
      limit: parseInt(limit)
    });
  } catch (error) {
    console.error('Error al obtener recetas publicadas:', error);
    res.status(500).json({
      success: false,
      error: 'Error al obtener las recetas publicadas'
    });
  }
});

/**
 * GET /api/recetas
 * Obtener todas las recetas
 * IMPORTANTE: Devuelve un array directamente para compatibilidad con el frontend
 */
router.get('/', async (req, res) => {
  try {
    const { page = 1, limit = 1000, categoria } = req.query;
    const offset = (page - 1) * limit;
    const where = {};
    
    if (categoria) where.categoria = categoria;

    const recetas = await Receta.findAndCountAll({
      where,
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['id', 'DESC']] // Usar id porque no hay fecha_envio en la tabla posts_recetas
    });

    // Retornar array directamente para compatibilidad con el frontend
    res.json(recetas.rows);
  } catch (error) {
    console.error('Error al obtener recetas:', error);
    res.status(500).json({
      success: false,
      error: 'Error al obtener las recetas'
    });
  }
});

/**
 * GET /api/recetas/:id
 * Obtener una receta por ID
 */
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const receta = await Receta.findByPk(id);

    if (!receta) {
      return res.status(404).json({
        success: false,
        error: 'Receta no encontrada'
      });
    }

    res.json({
      success: true,
      receta
    });
  } catch (error) {
    console.error('Error al obtener receta:', error);
    res.status(500).json({
      success: false,
      error: 'Error al obtener la receta'
    });
  }
});

/**
 * POST /api/recetas
 * Crear una nueva receta (SIN autenticación)
 */
router.post('/', handleMulterError, async (req, res) => {
  try {
    console.log('=== INICIO POST /api/recetas ===');
    console.log('Body recibido:', req.body);
    console.log('Archivo recibido:', req.file ? {
      filename: req.file.filename,
      originalname: req.file.originalname,
      mimetype: req.file.mimetype,
      size: req.file.size,
      path: req.file.path
    } : 'No hay archivo');

    // Verificar que el modelo Receta esté disponible
    if (!Receta) {
      console.error('ERROR: El modelo Receta no está disponible');
      return res.status(500).json({
        success: false,
        error: 'Error de configuración del servidor: Modelo Receta no disponible. Verifica las importaciones en el backend.'
      });
    }

    // Verificar conexión a la base de datos
    try {
      await sequelize.authenticate();
      console.log('Conexión a la base de datos establecida correctamente');
    } catch (dbError) {
      console.error('ERROR: No se pudo conectar a la base de datos:', dbError);
      return res.status(500).json({
        success: false,
        error: 'Error de conexión a la base de datos: ' + dbError.message
      });
    }

    const {
      titulo,
      autor,
      descripcion,
      porciones,
      tiempo,
      ingredientes,
      preparacion,
      consejo,
      categoria,
      creditos,
      instagram
    } = req.body;

    // Validaciones
    if (!titulo || !autor || !descripcion || !porciones || !tiempo ||
        !ingredientes || !preparacion || !categoria) {
      console.error('Faltan campos obligatorios:', {
        titulo: !!titulo,
        autor: !!autor,
        descripcion: !!descripcion,
        porciones: !!porciones,
        tiempo: !!tiempo,
        ingredientes: !!ingredientes,
        preparacion: !!preparacion,
        categoria: !!categoria
      });
      return res.status(400).json({
        success: false,
        error: 'Faltan campos obligatorios'
      });
    }

    const categoriasValidas = ['Entrante', 'Plato fuerte', 'Postre', 'Bebida', 'Otro'];
    if (!categoriasValidas.includes(categoria)) {
      return res.status(400).json({
        success: false,
        error: 'Categoría no válida'
      });
    }

    // Validar imagen
    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: 'La imagen es obligatoria'
      });
    }

    const imagenUrl = `/uploads/recetas/${req.file.filename}`;

    // Validar y preparar campos según los límites deseados
    const tituloTrimmed = titulo.trim();
    const descripcionTrimmed = descripcion.trim();
    const consejoTrimmed = consejo ? consejo.trim() : null;

    // Límites deseados (coinciden con el formulario)
    const LIMITE_TITULO = 100;
    const LIMITE_DESCRIPCION = 300;
    const LIMITE_CONSEJO = 200;

    // Validar longitudes
    const erroresValidacion = [];
    
    if (tituloTrimmed.length > LIMITE_TITULO) {
      erroresValidacion.push(`El título no puede exceder ${LIMITE_TITULO} caracteres (tiene ${tituloTrimmed.length})`);
    }
    
    if (descripcionTrimmed.length > LIMITE_DESCRIPCION) {
      erroresValidacion.push(`La descripción no puede exceder ${LIMITE_DESCRIPCION} caracteres (tiene ${descripcionTrimmed.length})`);
    }
    
    if (consejoTrimmed && consejoTrimmed.length > LIMITE_CONSEJO) {
      erroresValidacion.push(`El consejo no puede exceder ${LIMITE_CONSEJO} caracteres (tiene ${consejoTrimmed.length})`);
    }

    if (erroresValidacion.length > 0) {
      return res.status(400).json({
        success: false,
        error: 'Error de validación: ' + erroresValidacion.join(', ')
      });
    }

    // Usar los valores tal cual (sin truncar) ya que están dentro de los límites
    const tituloFinal = tituloTrimmed;
    const descripcionFinal = descripcionTrimmed;
    const consejoFinal = consejoTrimmed;

    // Crear la receta - SIN fecha_envio porque no existe en la tabla posts_recetas
    // La tabla posts_recetas tiene: id, titulo, autor, descripcion, porciones, tiempo, 
    // ingredientes, preparacion, consejo, categoria, imagen, creditos, instagram
    const recetaData = {
      titulo: tituloFinal,
      autor: autor.trim(),
      descripcion: descripcionFinal,
      porciones: porciones.trim(),
      tiempo: tiempo.trim(),
      ingredientes: ingredientes.trim(),
      preparacion: preparacion.trim(),
      consejo: consejoFinal,
      categoria,
      imagen: imagenUrl,
      creditos: creditos ? creditos.trim() : null,
      instagram: instagram ? instagram.trim() : null
      // NO incluir fecha_envio porque no existe en la tabla posts_recetas
    };

    console.log('Datos de receta a crear:', recetaData);
    console.log('Intentando crear receta en la base de datos...');

    const receta = await Receta.create(recetaData);

    console.log('Receta creada exitosamente:', receta.id);

    res.status(201).json({
      success: true,
      message: 'Receta creada correctamente',
      receta
    });
  } catch (error) {
    console.error('=== ERROR AL CREAR RECETA ===');
    console.error('Tipo de error:', error.name);
    console.error('Mensaje:', error.message);
    console.error('Stack trace completo:');
    console.error(error.stack);

    // Información adicional del error
    if (error instanceof ValidationError) {
      console.error('Errores de validación:', error.errors.map(e => e.message));
      // Eliminar archivo si se subió pero falló la validación de Sequelize
      if (req.file && fs.existsSync(req.file.path)) {
        try {
          fs.unlinkSync(req.file.path);
          console.log('Archivo eliminado después de error de validación');
        } catch (unlinkError) {
          console.error('Error al eliminar archivo después de validación:', unlinkError);
        }
      }
      return res.status(400).json({
        success: false,
        error: 'Error de validación: ' + error.errors.map(e => e.message).join(', '),
        details: error.errors.map(e => ({ field: e.path, message: e.message }))
      });
    }
    if (error instanceof DatabaseError) {
      console.error('Error de base de datos:', error.original);
      // Eliminar archivo si se subió pero falló la base de datos
      if (req.file && fs.existsSync(req.file.path)) {
        try {
          fs.unlinkSync(req.file.path);
          console.log('Archivo eliminado después de error de base de datos');
        } catch (unlinkError) {
          console.error('Error al eliminar archivo después de DB error:', unlinkError);
        }
      }
      return res.status(500).json({
        success: false,
        error: 'Error de base de datos: ' + error.message,
        details: process.env.NODE_ENV === 'development' ? error.original : undefined
      });
    }

    // Eliminar archivo si se subió pero falló la creación por otra razón
    if (req.file && fs.existsSync(req.file.path)) {
      try {
        fs.unlinkSync(req.file.path);
        console.log('Archivo eliminado después de error general');
      } catch (unlinkError) {
        console.error('Error al eliminar archivo después de error general:', unlinkError);
      }
    }

    // Asegurar que siempre se devuelva JSON
    res.status(500).json({
      success: false,
      error: 'Error al crear la receta: ' + error.message,
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});

/**
 * PUT /api/recetas/:id
 * Actualizar una receta (SIN autenticación)
 */
router.put('/:id', handleMulterError, async (req, res) => {
  try {
    const { id } = req.params;
    const {
      titulo,
      autor,
      descripcion,
      porciones,
      tiempo,
      ingredientes,
      preparacion,
      consejo,
      categoria,
      creditos,
      instagram
    } = req.body;

    const receta = await Receta.findByPk(id);

    if (!receta) {
      return res.status(404).json({
        success: false,
        error: 'Receta no encontrada'
      });
    }

    let imagenUrl = receta.imagen;

    // Si se subió una nueva imagen, eliminar la anterior
    if (req.file) {
      if (receta.imagen) {
        const oldImagePath = path.join(__dirname, '..', receta.imagen);
        if (fs.existsSync(oldImagePath)) {
          fs.unlinkSync(oldImagePath);
        }
      }
      imagenUrl = `/uploads/recetas/${req.file.filename}`;
    }

    const updateData = {};

    if (titulo) updateData.titulo = titulo.trim();
    if (autor) updateData.autor = autor.trim();
    if (descripcion) updateData.descripcion = descripcion.trim();
    if (porciones) updateData.porciones = porciones.trim();
    if (tiempo) updateData.tiempo = tiempo.trim();
    if (ingredientes) updateData.ingredientes = ingredientes.trim();
    if (preparacion) updateData.preparacion = preparacion.trim();
    if (consejo !== undefined) updateData.consejo = consejo ? consejo.trim() : null;
    if (categoria) updateData.categoria = categoria;
    if (creditos !== undefined) updateData.creditos = creditos ? creditos.trim() : null;
    if (instagram !== undefined) updateData.instagram = instagram ? instagram.trim() : null;

    updateData.imagen = imagenUrl;

    await receta.update(updateData);
    const recetaActualizada = await Receta.findByPk(id);

    res.json({
      success: true,
      message: 'Receta actualizada correctamente',
      receta: recetaActualizada
    });
  } catch (error) {
    console.error('Error al actualizar receta:', error);

    // Eliminar archivo si se subió pero falló la actualización
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }

    res.status(500).json({
      success: false,
      error: 'Error al actualizar la receta: ' + error.message
    });
  }
});

/**
 * DELETE /api/recetas/:id
 * Eliminar una receta (SIN autenticación)
 */
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const receta = await Receta.findByPk(id);

    if (!receta) {
      return res.status(404).json({
        success: false,
        error: 'Receta no encontrada'
      });
    }

    // Eliminar imagen asociada
    if (receta.imagen) {
      const imagePath = path.join(__dirname, '..', receta.imagen);
      if (fs.existsSync(imagePath)) {
        fs.unlinkSync(imagePath);
      }
    }

    await receta.destroy();

    res.json({
      success: true,
      message: 'Receta eliminada correctamente'
    });
  } catch (error) {
    console.error('Error al eliminar receta:', error);
    res.status(500).json({
      success: false,
      error: 'Error al eliminar la receta: ' + error.message
    });
  }
});

// Middleware de manejo de errores global para el router
router.use((err, req, res, next) => {
  console.error('Error no manejado en rutas de recetas:', err);
  res.status(err.status || 500).json({
    success: false,
    error: err.message || 'Error interno del servidor en rutas de recetas'
  });
});

module.exports = router;

