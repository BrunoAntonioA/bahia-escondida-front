import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Product } from '../../shared/models/product';
import { ProductsService } from '../../shared/services/products.service';

@Component({
  selector: 'app-products',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './products.component.html',
  styleUrl: './products.component.css',
})
export class ProductsComponent {
  products: Product[] = [];
  categories: string[] = ['Bebestible', 'Comida'];

  newProduct: Product = {
    clientId: 'bahia-escondida',
    name: '',
    category: '',
    price: null as any,
  };

  constructor(private productService: ProductsService) {}

  ngOnInit(): void {
    this.loadProducts();
  }

  loadProducts() {
    this.productService.getProducts().subscribe((products) => {
      console.log('products: ', products);
      this.products = products ?? [];
    });
  }

  addProduct() {
    console.log('add product function');
    const productToCreate: Product = { ...this.newProduct };

    this.productService.addProduct(productToCreate).subscribe({
      next: (createdProduct) => {
        this.products.push(createdProduct);

        this.newProduct = {
          clientId: 'bahia-escondida',
          name: '',
          category: '',
          price: null as any,
        };
      },
      error: (err) => {
        console.error('Error creating product:', err);
      },
    });
  }

  deleteProduct(index: number, productId?: number) {
    console.log('remove product function');
    console.log('productId: ', productId);
    console.log('index: ', index);

    if (!productId) return;

    this.productService.deleteProduct(productId).subscribe({
      next: () => {
        this.products.splice(index, 1);
        console.log('Product deleted successfully');
      },
      error: (err) => {
        console.error('Error creating product:', err);
      },
    });
  }

  onTestClick() {
    console.log('BUTTON CLICK WORKS');
  }
}
