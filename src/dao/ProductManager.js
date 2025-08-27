const fs = require('fs').promises;
const path = require('path');
const fsSync = require('fs');

class ProductManager {
  static rutaDatos = '';

  static async getProducts() {
    if (fsSync.existsSync(this.rutaDatos)) {
      const data = await fs.readFile(this.rutaDatos, 'utf-8');
      return JSON.parse(data);
    }
    return [];
  }

  static async getProductById(id) {
    const products = await this.getProducts();
    return products.find(p => p.id === id) || null;
  }

  static async addProduct(productData) {
    const products = await this.getProducts();

    const newProduct = {
      id: products.length > 0 ? Math.max(...products.map(p => p.id)) + 1 : 1,
      title: productData.title,
      description: productData.description,
      code: productData.code,
      price: Number(productData.price),
      status: productData.status !== false,
      stock: Number(productData.stock),
      category: productData.category,
      thumbnails: productData.thumbnails || []
    };

    products.push(newProduct);
    await fs.writeFile(this.rutaDatos, JSON.stringify(products, null, 2));
    return newProduct;
  }

  static async updateProduct(id, updatedFields) {
    const products = await this.getProducts();
    const index = products.findIndex(p => p.id === id);

    if (index === -1) {
      return { error: 'Producto no encontrado' };
    }

    products[index] = {
      ...products[index],
      ...updatedFields
    };

    await fs.writeFile(this.rutaDatos, JSON.stringify(products, null, 2));
    return products[index];
  }

  static async deleteProduct(id) {
    const products = await this.getProducts();
    const newProducts = products.filter(p => p.id !== id);

    if (newProducts.length === products.length) {
      return { error: 'Producto no encontrado' };
    }

    await fs.writeFile(this.rutaDatos, JSON.stringify(newProducts, null, 2));
    return { success: true };
  }
}

module.exports = ProductManager;