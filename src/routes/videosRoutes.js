// src/routes/videosRoutes.js
require('dotenv').config();
const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs').promises;
const Video = require('../models/Video');

// 📌 Configuración Multer para videos (miniaturas)
const storage = multer.diskStorage({
  destination: async (req, file, cb) => {
    const basePath = '/var/www/vhosts/estrellasdenuevoleon.com.mx/httpdocs/fotos/videos/miniaturas';
    await fs.mkdir(basePath, { recursive: true });
    cb(null, basePath);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, uniqueSuffix + ext);
  }
});

const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    const allowedMimes = ['image/jpeg', 'image/png', 'image/webp'];
    if (allowedMimes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Tipo de archivo no permitido. Solo JPG, PNG, WEBP.'), false);
    }
  },
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB máximo
});

// 📌 GET todos los videos
router.get('/', async (req, res) => {
  try {
    const videos = await Video.findAll({ order: [['fecha', 'DESC']] });
    const baseUrl = process.env.BASE_URL || 'https://estrellasdenuevoleon.com.mx';

    const videosConUrl = videos.map(v => ({
      ...v.dataValues,
      // Mapear 'estado' a 'activo' para compatibilidad con el frontend
      activo: v.estado,
      imagen: v.imagen ? `${baseUrl}${v.imagen}` : null
    }));

    res.json(videosConUrl);
  } catch (error) {
    console.error('Error obteniendo videos:', error);
    res.status(500).json({ error: 'Error al obtener los videos', details: error.message });
  }
});

// 📌 POST agregar un video con imagen
router.post('/', upload.single('imagen'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'La miniatura (imagen) es obligatoria' });
    }

    const { url, fecha } = req.body;

    if (!url) {
      return res.status(400).json({ error: 'La URL del video es obligatoria' });
    }

    const data = {
      url,
      fecha: fecha || new Date(),
      imagen: `/fotos/videos/miniaturas/${req.file.filename}`,
      estado: true // Por defecto activo
    };

    const video = await Video.create(data);

    const baseUrl = process.env.BASE_URL || 'https://estrellasdenuevoleon.com.mx';
    res.status(201).json({
      ...video.dataValues,
      activo: video.estado, // Mapear para el frontend
      imagen: `${baseUrl}${video.imagen}`
    });
  } catch (error) {
    console.error('Error creando video:', error);
    res.status(500).json({ error: 'Error al guardar el video', details: error.message });
  }
});

// 📌 PUT actualizar estado activo/inactivo (toggle)
router.put('/:id/toggle', async (req, res) => {
  try {
    const { id } = req.params;
    const video = await Video.findByPk(id);
    
    if (!video) {
      return res.status(404).json({ error: 'Video no encontrado' });
    }

    // Cambiar el estado (estado es BOOLEAN en el modelo)
    video.estado = !video.estado;
    await video.save();
    
    const baseUrl = process.env.BASE_URL || 'https://estrellasdenuevoleon.com.mx';
    res.json({ 
      success: true,
      mensaje: 'Estado actualizado', 
      activo: video.estado, // Para el frontend
      estado: video.estado, // Para el backend
      video: {
        ...video.dataValues,
        activo: video.estado, // Mapear para el frontend
        imagen: video.imagen ? `${baseUrl}${video.imagen}` : null
      }
    });
  } catch (error) {
    console.error('Error al cambiar estado:', error);
    res.status(500).json({ error: 'Error al cambiar estado', details: error.message });
  }
});

// 📌 PUT activar video específicamente
router.put('/:id/activar', async (req, res) => {
  try {
    const { id } = req.params;
    const video = await Video.findByPk(id);
    
    if (!video) {
      return res.status(404).json({ error: 'Video no encontrado' });
    }

    video.estado = true; // Activar
    await video.save();
    
    const baseUrl = process.env.BASE_URL || 'https://estrellasdenuevoleon.com.mx';
    res.json({ 
      success: true,
      mensaje: 'Video activado', 
      activo: true,
      estado: true,
      video: {
        ...video.dataValues,
        activo: true,
        imagen: video.imagen ? `${baseUrl}${video.imagen}` : null
      }
    });
  } catch (error) {
    console.error('Error al activar video:', error);
    res.status(500).json({ error: 'Error al activar video', details: error.message });
  }
});

// 📌 PUT desactivar video específicamente
router.put('/:id/desactivar', async (req, res) => {
  try {
    const { id } = req.params;
    const video = await Video.findByPk(id);
    
    if (!video) {
      return res.status(404).json({ error: 'Video no encontrado' });
    }

    video.estado = false; // Desactivar
    await video.save();
    
    const baseUrl = process.env.BASE_URL || 'https://estrellasdenuevoleon.com.mx';
    res.json({ 
      success: true,
      mensaje: 'Video desactivado', 
      activo: false,
      estado: false,
      video: {
        ...video.dataValues,
        activo: false,
        imagen: video.imagen ? `${baseUrl}${video.imagen}` : null
      }
    });
  } catch (error) {
    console.error('Error al desactivar video:', error);
    res.status(500).json({ error: 'Error al desactivar video', details: error.message });
  }
});

// 📌 PUT activar TODOS los videos
router.put('/activar-todos', async (req, res) => {
  try {
    const videos = await Video.findAll();
    
    if (videos.length === 0) {
      return res.status(404).json({ error: 'No hay videos para activar' });
    }

    // Activar todos los videos
    await Promise.all(videos.map(video => {
      video.estado = true;
      return video.save();
    }));

    const baseUrl = process.env.BASE_URL || 'https://estrellasdenuevoleon.com.mx';
    res.json({ 
      success: true,
      mensaje: `${videos.length} videos han sido activados exitosamente`,
      videosActivados: videos.length
    });
  } catch (error) {
    console.error('Error al activar todos los videos:', error);
    res.status(500).json({ error: 'Error al activar todos los videos', details: error.message });
  }
});

// 📌 PUT desactivar TODOS los videos
router.put('/desactivar-todos', async (req, res) => {
  try {
    const videos = await Video.findAll();
    
    if (videos.length === 0) {
      return res.status(404).json({ error: 'No hay videos para desactivar' });
    }

    // Desactivar todos los videos
    await Promise.all(videos.map(video => {
      video.estado = false;
      return video.save();
    }));

    const baseUrl = process.env.BASE_URL || 'https://estrellasdenuevoleon.com.mx';
    res.json({ 
      success: true,
      mensaje: `${videos.length} videos han sido desactivados exitosamente`,
      videosDesactivados: videos.length
    });
  } catch (error) {
    console.error('Error al desactivar todos los videos:', error);
    res.status(500).json({ error: 'Error al desactivar todos los videos', details: error.message });
  }
});

// 📌 PUT actualizar video completo
router.put('/:id', upload.single('imagen'), async (req, res) => {
  try {
    const { id } = req.params;
    const { url, fecha } = req.body;
    
    const video = await Video.findByPk(id);
    if (!video) {
      return res.status(404).json({ error: 'Video no encontrado' });
    }

    // Si hay nueva imagen, eliminar la anterior
    if (req.file && video.imagen) {
      const oldFilePath = path.join(
        '/var/www/vhosts/estrellasdenuevoleon.com.mx/httpdocs',
        video.imagen
      );
      try {
        await fs.unlink(oldFilePath);
      } catch (err) {
        console.warn('⚠️ No se pudo eliminar la imagen anterior:', err.message);
      }
    }

    // Actualizar campos
    if (req.file) {
      video.imagen = `/fotos/videos/miniaturas/${req.file.filename}`;
    }
    if (url) video.url = url;
    if (fecha) video.fecha = fecha;

    await video.save();

    const baseUrl = process.env.BASE_URL || 'https://estrellasdenuevoleon.com.mx';
    res.json({
      ...video.dataValues,
      activo: video.estado, // Mapear para el frontend
      imagen: video.imagen ? `${baseUrl}${video.imagen}` : null
    });
  } catch (error) {
    console.error('Error actualizando video:', error);
    res.status(500).json({ error: 'Error al actualizar el video', details: error.message });
  }
});

// 📌 DELETE eliminar un video por ID
router.delete('/:id', async (req, res) => {
  try {
    const video = await Video.findByPk(req.params.id);

    if (!video) {
      return res.status(404).json({ error: 'Video no encontrado' });
    }

    // Eliminar archivo físico si existe
    if (video.imagen) {
      const filePath = path.join(
        '/var/www/vhosts/estrellasdenuevoleon.com.mx/httpdocs',
        video.imagen
      );

      try {
        await fs.unlink(filePath);
      } catch (err) {
        console.warn('⚠️ No se pudo eliminar la miniatura física:', err.message);
      }
    }

    // Eliminar registro en BD
    await video.destroy();

    res.json({ message: 'Video eliminado correctamente' });
  } catch (error) {
    console.error('Error eliminando video:', error);
    res.status(500).json({ error: 'Error interno del servidor', details: error.message });
  }
});

module.exports = router;
