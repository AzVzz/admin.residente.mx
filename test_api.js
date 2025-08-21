// Script de prueba para verificar la API de videos
const fetch = require('node-fetch');

const BASE_URL = 'https://estrellasdenuevoleon.com.mx'; // Cambia esto por tu URL real
const TEST_TOKEN = 'tu_token_aqui'; // Cambia esto por un token válido

async function testAPI() {
  console.log('🧪 Probando API de videos...\n');

  try {
    // 1. Probar GET /api/video
    console.log('1️⃣ Probando GET /api/video...');
    const response1 = await fetch(`${BASE_URL}/api/video`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${TEST_TOKEN}`,
        'Content-Type': 'application/json'
      }
    });
    
    console.log(`Status: ${response1.status}`);
    if (response1.ok) {
      const data1 = await response1.json();
      console.log(`✅ Videos obtenidos: ${data1.length}`);
      if (data1.length > 0) {
        console.log('Primer video:', {
          id: data1[0].id,
          estado: data1[0].estado,
          activo: data1[0].activo
        });
      }
    } else {
      const error1 = await response1.text();
      console.log(`❌ Error: ${error1}`);
    }
    console.log('');

    if (response1.ok && data1.length > 0) {
      const videoId = data1[0].id;
      const estadoActual = data1[0].estado;
      
      // 2. Probar PUT /api/video/:id/toggle
      console.log(`2️⃣ Probando PUT /api/video/${videoId}/toggle...`);
      const response2 = await fetch(`${BASE_URL}/api/video/${videoId}/toggle`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${TEST_TOKEN}`,
          'Content-Type': 'application/json'
        }
      });
      
      console.log(`Status: ${response2.status}`);
      if (response2.ok) {
        const data2 = await response2.json();
        console.log('✅ Toggle exitoso:', data2);
      } else {
        const error2 = await response2.text();
        console.log(`❌ Error: ${error2}`);
      }
      console.log('');

      // 3. Probar PUT /api/video/:id/desactivar
      console.log(`3️⃣ Probando PUT /api/video/${videoId}/desactivar...`);
      const response3 = await fetch(`${BASE_URL}/api/video/${videoId}/desactivar`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${TEST_TOKEN}`,
          'Content-Type': 'application/json'
        }
      });
      
      console.log(`Status: ${response3.status}`);
      if (response3.ok) {
        const data3 = await response3.json();
        console.log('✅ Desactivar exitoso:', data3);
      } else {
        const error3 = await response3.text();
        console.log(`❌ Error: ${error3}`);
      }
      console.log('');

      // 4. Probar PUT /api/video/:id/activar
      console.log(`4️⃣ Probando PUT /api/video/${videoId}/activar...`);
      const response4 = await fetch(`${BASE_URL}/api/video/${videoId}/activar`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${TEST_TOKEN}`,
          'Content-Type': 'application/json'
        }
      });
      
      console.log(`Status: ${response4.status}`);
      if (response4.ok) {
        const data4 = await response4.json();
        console.log('✅ Activar exitoso:', data4);
      } else {
        const error4 = await response4.text();
        console.log(`❌ Error: ${error4}`);
      }
      console.log('');

      // 5. Verificar estado final
      console.log('5️⃣ Verificando estado final...');
      const response5 = await fetch(`${BASE_URL}/api/video`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${TEST_TOKEN}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response5.ok) {
        const data5 = await response5.json();
        const videoFinal = data5.find(v => v.id === videoId);
        if (videoFinal) {
          console.log('Estado final del video:', {
            id: videoFinal.id,
            estado: videoFinal.estado,
            activo: videoFinal.activo
          });
        }
      }
    }

  } catch (error) {
    console.error('❌ Error general:', error.message);
  }
}

// Ejecutar la prueba
testAPI();

