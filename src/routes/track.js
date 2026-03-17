const express = require('express');
const { poolPromise, sql } = require('../config/db');
const router = express.Router();

// Código mágico de uma imagem GIF transparente de 1x1 pixel
const pixel = Buffer.from('R0lGODlhAQABAIAAAP///wAAACH5BAEAAAAALAAAAAABAAEAAAICRAEAOw==', 'base64');

router.get('/:trackId', async (req, res) => {
  try {
    const pool = await poolPromise;
    // Se o e-mail foi aberto, grava a data e hora no banco de dados
    await pool.request()
      .input('track_id', sql.VarChar, req.params.trackId)
      .query('UPDATE Logs SET read_at = GETDATE() WHERE track_id = @track_id AND read_at IS NULL');
  } catch (err) {
    // Ignora erros para não quebrar a tela do cliente
  }

  // Devolve a imagem transparente e diz ao navegador para nunca guardar em cache (senão ele só acusa leitura na 1ª vez)
  res.writeHead(200, {
    'Content-Type': 'image/gif',
    'Content-Length': pixel.length,
    'Cache-Control': 'no-cache, no-store, must-revalidate',
    'Pragma': 'no-cache',
    'Expires': '0'
  });
  res.end(pixel);
});

module.exports = router;