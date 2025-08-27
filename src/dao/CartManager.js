const fs = require('fs').promises;
const path = require('path');
const fsSync = require('fs');

class CartManager {
  static rutaDatos = '';

  static async getCarts() {
    if (fsSync.existsSync(this.rutaDatos)) {
      const data = await fs.readFile(this.rutaDatos, 'utf-8');
      return JSON.parse(data);
    }
    return [];
  }

  static async createCart() {
    const carts = await this.getCarts();

    const newCart = {
      id: carts.length > 0 ? Math.max(...carts.map(c => c.id)) + 1 : 1,
      products: []
    };

    carts.push(newCart);
    await fs.writeFile(this.rutaDatos, JSON.stringify(carts, null, 2));
    return newCart;
  }

  static async getCartById(id) {
    const carts = await this.getCarts();
    return carts.find(c => c.id === id) || null;
  }

  static async addProductToCart(cartId, productId) {
    const carts = await this.getCarts();
    const cartIndex = carts.findIndex(c => c.id === cartId);

    if (cartIndex === -1) {
      return { error: 'Carrito no encontrado' };
    }

    const productIndex = carts[cartIndex].products.findIndex(p => p.product === productId);

    if (productIndex !== -1) {
      carts[cartIndex].products[productIndex].quantity += 1;
    } else {
      carts[cartIndex].products.push({ product: productId, quantity: 1 });
    }

    await fs.writeFile(this.rutaDatos, JSON.stringify(carts, null, 2));
    return { success: true };
  }
}

module.exports = CartManager;