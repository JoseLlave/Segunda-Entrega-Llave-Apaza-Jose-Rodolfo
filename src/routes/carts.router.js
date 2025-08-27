const { Router } = require('express');

module.exports = (cartManager) => {
  const router = Router();

  router.post('/', async (req, res) => {
    try {
      const newCart = await cartManager.createCart();
      res.status(201).json(newCart);
    } catch (error) {
      console.error('Error al crear carrito:', error);
      res.status(500).json({ error: 'Error interno del servidor' });
    }
  });

  router.get('/:cid', async (req, res) => {
    try {
      const cart = await cartManager.getCartById(Number(req.params.cid));
      cart
        ? res.json(cart.products)
        : res.status(404).json({ error: 'Carrito no encontrado' });
    } catch (error) {
      console.error('Error al obtener carrito:', error);
      res.status(500).json({ error: 'Error interno del servidor' });
    }
  });

  router.post('/:cid/product/:pid', async (req, res) => {
    try {
      const result = await cartManager.addProductToCart(
        Number(req.params.cid),
        Number(req.params.pid)
      );
      result.error
        ? res.status(400).json(result)
        : res.status(201).json({ message: 'Producto agregado al carrito' });
    } catch (error) {
      console.error('Error al agregar producto al carrito:', error);
      res.status(500).json({ error: 'Error interno del servidor' });
    }
  });

  return router;
};