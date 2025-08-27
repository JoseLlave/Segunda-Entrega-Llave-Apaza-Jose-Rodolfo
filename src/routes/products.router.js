const { Router } = require('express');

module.exports = (productManager) => {
  const router = Router();

  router.get('/', async (req, res) => {
    try {
      const products = await productManager.getProducts();
      res.json(products);
    } catch (error) {
      console.error('Error al obtener productos:', error);
      res.status(500).json({ error: 'Error interno del servidor' });
    }
  });

  router.get('/:pid', async (req, res) => {
    try {
      const productId = Number(req.params.pid);
      if (isNaN(productId)) {
        return res.status(400).json({ error: 'ID de producto inválido' });
      }

      const product = await productManager.getProductById(productId);
      if (product) {
        res.json(product);
      } else {
        res.status(404).json({ error: 'Producto no encontrado' });
      }
    } catch (error) {
      console.error('Error al obtener producto:', error);
      res.status(500).json({ error: 'Error interno del servidor' });
    }
  });

  router.post('/', async (req, res) => {
    try {
      const productData = req.body;

      const requiredFields = ['title', 'description', 'code', 'price', 'stock', 'category'];
      const missingFields = requiredFields.filter(field => !productData[field]);

      if (missingFields.length > 0) {
        return res.status(400).json({ error: `Faltan campos requeridos: ${missingFields.join(', ')}` });
      }

      const products = await productManager.getProducts();
      if (products.some(p => p.code === productData.code)) {
        return res.status(400).json({ error: 'El código del producto ya existe' });
      }

      const result = await productManager.addProduct(productData);

      if (req.io) {
        const updatedProducts = await productManager.getProducts();
        req.io.emit('updateProducts', updatedProducts);
      }

      res.status(201).json(result);
    } catch (error) {
      console.error('Error al crear producto:', error);
      res.status(500).json({ error: 'Error interno del servidor' });
    }
  });

  router.put('/:pid', async (req, res) => {
    try {
      const productId = Number(req.params.pid);
      if (isNaN(productId)) {
        return res.status(400).json({ error: 'ID de producto inválido' });
      }

      const updatedFields = req.body;
      
      if (updatedFields.id) {
        delete updatedFields.id;
      }

      const existingProduct = await productManager.getProductById(productId);
      if (!existingProduct) {
        return res.status(404).json({ error: 'Producto no encontrado' });
      }

      if (updatedFields.code) {
        const products = await productManager.getProducts();
        const otherProductWithSameCode = products.find(p => p.code === updatedFields.code && p.id !== productId);
        if (otherProductWithSameCode) {
          return res.status(400).json({ error: 'El código del producto ya existe en otro producto' });
        }
      }

      const result = await productManager.updateProduct(productId, updatedFields);
      
      if (req.io) {
        const updatedProducts = await productManager.getProducts();
        req.io.emit('updateProducts', updatedProducts);
      }

      res.json(result);
    } catch (error) {
      console.error('Error al actualizar producto:', error);
      res.status(500).json({ error: 'Error interno del servidor' });
    }
  });

  router.delete('/:pid', async (req, res) => {
    try {
      const productId = Number(req.params.pid);
      if (isNaN(productId)) {
        return res.status(400).json({ error: 'ID de producto inválido' });
      }

      const existingProduct = await productManager.getProductById(productId);
      if (!existingProduct) {
        return res.status(404).json({ error: 'Producto no encontrado' });
      }

      const result = await productManager.deleteProduct(productId);
      
      if (req.io) {
        const updatedProducts = await productManager.getProducts();
        req.io.emit('updateProducts', updatedProducts);
      }

      res.status(204).end();
    } catch (error) {
      console.error('Error al eliminar producto:', error);
      res.status(500).json({ error: 'Error interno del servidor' });
    }
  });

  return router;
};