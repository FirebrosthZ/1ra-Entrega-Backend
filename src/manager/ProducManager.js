import fs from 'fs/promises';
import path from 'path';

class ProductManager {
  constructor(filePath) {
    this.path = filePath;
    this.init();
  }

  async init() {
    try {
      await fs.access(this.path);
    } catch (error) {
      await this.saveProducts([]);
    }
  }

  async getProducts() {
    try {
      const data = await fs.readFile(this.path, 'utf-8');
      return JSON.parse(data);
    } catch (error) {
      return [];
    }
  }

  async saveProducts(products) {
    try {
      const dirPath = path.dirname(this.path);
      await fs.mkdir(dirPath, { recursive: true });
      await fs.writeFile(this.path, JSON.stringify(products, null, 2));
    } catch (error) {
      throw new Error(`Error al guardar productos: ${error.message}`);
    }
  }

  async addProduct(product) {
    try {
      const products = await this.getProducts();
      
      // Validar campos requeridos
      const requiredFields = ['title', 'description', 'code', 'price', 'stock', 'category'];
      for (const field of requiredFields) {
        if (!product[field]) {
          throw new Error(`El campo ${field} es requerido`);
        }
      }

      // Verificar que el código no se repita
      const existingProduct = products.find(p => p.code === product.code);
      if (existingProduct) {
        throw new Error(`Ya existe un producto con el código: ${product.code}`);
      }

      // Generar ID único
      const newId = products.length > 0 ? Math.max(...products.map(p => p.id)) + 1 : 1;

      // Crear nuevo producto con valores por defecto
      const newProduct = {
        id: newId,
        title: product.title,
        description: product.description,
        code: product.code,
        price: Number(product.price),
        status: product.status !== undefined ? Boolean(product.status) : true,
        stock: Number(product.stock),
        category: product.category,
        thumbnails: Array.isArray(product.thumbnails) ? product.thumbnails : []
      };

      products.push(newProduct);
      await this.saveProducts(products);
      return newProduct;
    } catch (error) {
      throw error;
    }
  }

  async getProductById(id) {
    try {
      const products = await this.getProducts();
      const product = products.find(p => p.id == id);
      if (!product) {
        throw new Error(`Producto con id ${id} no encontrado`);
      }
      return product;
    } catch (error) {
      throw error;
    }
  }

  async updateProduct(id, updateData) {
    try {
      const products = await this.getProducts();
      const productIndex = products.findIndex(p => p.id == id);
      
      if (productIndex === -1) {
        throw new Error(`Producto con id ${id} no encontrado`);
      }

      // No permitir actualizar el ID
      if (updateData.id) {
        delete updateData.id;
      }

      // Si se intenta actualizar el código, verificar que no exista
      if (updateData.code) {
        const existingProduct = products.find(p => p.code === updateData.code && p.id != id);
        if (existingProduct) {
          throw new Error(`Ya existe un producto con el código: ${updateData.code}`);
        }
      }

      // Actualizar solo los campos proporcionados
      products[productIndex] = { ...products[productIndex], ...updateData };
      
      // Asegurar tipos correctos
      if (updateData.price) products[productIndex].price = Number(updateData.price);
      if (updateData.stock) products[productIndex].stock = Number(updateData.stock);
      if (updateData.status !== undefined) products[productIndex].status = Boolean(updateData.status);

      await this.saveProducts(products);
      return products[productIndex];
    } catch (error) {
      throw error;
    }
  }

  async deleteProduct(id) {
    try {
      const products = await this.getProducts();
      const productIndex = products.findIndex(p => p.id == id);
      
      if (productIndex === -1) {
        throw new Error(`Producto con id ${id} no encontrado`);
      }

      const deletedProduct = products[productIndex];
      products.splice(productIndex, 1);
      await this.saveProducts(products);
      return deletedProduct;
    } catch (error) {
      throw error;
    }
  }
}

export default ProductManager;