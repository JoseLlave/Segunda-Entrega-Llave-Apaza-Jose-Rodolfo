const express = require('express');
const { engine } = require('express-handlebars');
const { Server } = require('socket.io');
const http = require('http');

const ProductManager = require('./dao/ProductManager');
const CartManager = require('./dao/CartManager');

const productsRouter = require('./routes/products.router');
const cartsRouter = require('./routes/carts.router');
const viewsRouter = require('./routes/views.router');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

const PORT = 8080;

ProductManager.rutaDatos = './src/data/products.json';
CartManager.rutaDatos = './src/data/carts.json';

app.engine('handlebars', engine());
app.set('view engine', 'handlebars');
app.set('views', './src/views');

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use((req, res, next) => {
  req.io = io;
  next();
});

app.use('/api/products', productsRouter(ProductManager));
app.use('/api/carts', cartsRouter(CartManager));
app.use('/', viewsRouter(ProductManager));

io.on('connection', (socket) => {
  console.log('Cliente conectado:', socket.id);

  socket.on('newProduct', async (productData) => {
    try {
      console.log('Recibiendo nuevo producto:', productData);
      
      const requiredFields = ['title', 'description', 'code', 'price', 'stock', 'category'];
      const missingFields = requiredFields.filter(field => !productData[field]);

      if (missingFields.length > 0) {
        socket.emit('error', `Faltan campos requeridos: ${missingFields.join(', ')}`);
        return;
      }

      const products = await ProductManager.getProducts();
      if (products.some(p => p.code === productData.code)) {
        socket.emit('error', 'El código del producto ya existe');
        return;
      }

      const newProduct = await ProductManager.addProduct(productData);
      console.log('Producto creado:', newProduct);
      
      const updatedProducts = await ProductManager.getProducts();
      io.emit('updateProducts', updatedProducts);
      
    } catch (error) {
      console.error('Error al crear producto:', error);
      socket.emit('error', 'Error interno del servidor');
    }
  });

  socket.on('deleteProduct', async (productId) => {
    try {
      console.log('Eliminando producto:', productId);
      
      const result = await ProductManager.deleteProduct(productId);
      
      if (result && result.error) {
        socket.emit('error', result.error);
        return;
      }

      const updatedProducts = await ProductManager.getProducts();
      io.emit('updateProducts', updatedProducts);
      
    } catch (error) {
      console.error('Error al eliminar producto:', error);
      socket.emit('error', 'Error interno del servidor');
    }
  });

  socket.on('disconnect', () => {
    console.log('Cliente desconectado:', socket.id);
  });
});

app.get('/', (req, res) => {
  res.redirect('/home');
});

server.listen(PORT, () => {
  console.log(`Servidor online en http://localhost:${PORT}`);
});