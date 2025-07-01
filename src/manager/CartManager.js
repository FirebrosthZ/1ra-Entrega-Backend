import fs from 'fs/promises';
import path from 'path';

class CartManager {
  constructor(filePath) {
    this.path = filePath;
    this.init();
  }

  async init() {
    try {
      await fs.access(this.path);
    } catch (error) {
      await this.saveCarts([]);
    }
  }

  async getCarts() {
    try {
      const data = await fs.readFile(this.path, 'utf-8');
      return JSON.parse(data);
    } catch (error) {
      return [];
    }
  }

  async saveCarts(carts) {
    try {
      const dirPath = path.dirname(this.path);
      await fs.mkdir(dirPath, { recursive: true });
      await fs.writeFile(this.path, JSON.stringify(carts, null, 2));
    } catch (error) {
      throw new Error(`Error al guardar carritos: ${error.message}`);
    }
  }

  async createCart() {
    try {
      const carts = await this.getCarts();
      
      // Generar ID único
      const newId = carts.length > 0 ? Math.max(...carts.map(c => c.id)) + 1 : 1;

      const newCart = {
        id: newId,
        products: []
      };

      carts.push(newCart);
      await this.saveCarts(carts);
      return newCart;
    } catch (error) {
      throw error;
    }
  }

  async getCartById(id) {
    try {
      const carts = await this.getCarts();
      const cart = carts.find(c => c.id == id);
      if (!cart) {
        throw new Error(`Carrito con id ${id} no encontrado`);
      }
      return cart;
    } catch (error) {
      throw error;
    }
  }

  async addProductToCart(cartId, productId) {
    try {
      const carts = await this.getCarts();
      const cartIndex = carts.findIndex(c => c.id == cartId);
      
      if (cartIndex === -1) {
        throw new Error(`Carrito con id ${cartId} no encontrado`);
      }

      const cart = carts[cartIndex];
      const existingProductIndex = cart.products.findIndex(p => p.product == productId);

      if (existingProductIndex !== -1) {
        // Si el producto ya existe, incrementar la cantidad
        cart.products[existingProductIndex].quantity += 1;
      } else {
        // Si el producto no existe, agregarlo con cantidad 1
        cart.products.push({
          product: productId,
          quantity: 1
        });
      }

      await this.saveCarts(carts);
      return cart;
    } catch (error) {
      throw error;
    }
  }
}

export default CartManager;