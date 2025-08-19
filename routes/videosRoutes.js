const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const Video = require('../models/Video');

// Carpeta destino en tu servidor Plesk
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, '../fotos/videos/miniaturas'));
  },
  filename: (req, file, cb) => {
    const uniqueName = Date.now() + path.extname(file.originalname);
    cb(null, uniqueName);
  }
});

const upload = multer({ storage });

// 📌 GET todos los videos
router.get('/', async (req, res) => {
  try {
    const videos = await Video.findAll({ order: [['fecha', 'DESC']] });
    res.json(videos);
  } catch (error) {
    console.error('Error al obtener videos:', error);
    res.status(500).json({ error: 'Error al obtener los videos' });
  }
});

// 📌 POST agregar un video con imagen
router.post('/', upload.single('imagen'), async (req, res) => {
  console.log('=== REQUEST RECIBIDA ===');
  console.log('Body:', req.body);
  console.log('File:', req.file);
  console.log('Headers:', req.headers);
  
  try {
    const { url, fecha } = req.body;
    const imagen = req.file ? req.file.filename : null;

    console.log('Datos extraídos:', { url, fecha, imagen });

    if (!imagen) {
      console.log('Error: No hay imagen');
      return res.status(400).json({ error: 'La imagen es obligatoria' });
    }

    if (!url) {
      console.log('Error: No hay URL');
      return res.status(400).json({ error: 'La URL es obligatoria' });
    }

    // Crear el video con todos los campos
    const nuevoVideo = await Video.create({ 
      imagen, 
      url, 
      fecha: fecha || new Date()
    });
    
    console.log('Video creado exitosamente:', nuevoVideo);
    res.status(201).json(nuevoVideo);
  } catch (error) {
    console.error('Error completo al crear video:', error);
    console.error('Stack trace:', error.stack);
    console.error('Tipo de error:', error.constructor.name);
    res.status(500).json({ 
      error: error.message || 'Error al guardar el video',
      details: error.stack 
    });
  }
});

// 📌 DELETE eliminar un video
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const eliminado = await Video.destroy({ where: { id } });

    if (eliminado) {
      res.json({ mensaje: 'Video eliminado correctamente' });
    } else {
      res.status(404).json({ error: 'Video no encontrado' });
    }
  } catch (error) {
    console.error('Error al eliminar video:', error);
    res.status(500).json({ error: 'Error al eliminar el video' });
  }
});

module.exports = router;
