const { Router } = require('express');

module.exports = (productManager) => {
  const router = Router();

  router.get('/home', async (req, res) => {
    try {
      const products = await productManager.getProducts();
      res.render('home', { products });
    } catch (error) {
      console.error('Error al obtener productos:', error);
      res.status(500).render('error', { error: 'Error interno del servidor' });
    }
  });

  router.get('/realtimeproducts', async (req, res) => {
    try {
      const products = await productManager.getProducts();
      res.render('realTimeProducts', { products });
    } catch (error) {
      console.error('Error al obtener productos:', error);
      res.status(500).render('error', { error: 'Error interno del servidor' });
    }
  });

  return router;
};