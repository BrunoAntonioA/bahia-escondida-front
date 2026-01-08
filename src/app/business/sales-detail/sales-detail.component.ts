import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Product, SaleProduct } from '../../shared/models/product';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Sale } from '../../shared/models/sales';
import { ProductsService } from '../../shared/services/products.service';
import { SalesService } from '../../shared/services/sales/sales.service';

@Component({
  selector: 'app-sales-detail',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './sales-detail.component.html',
  styleUrl: './sales-detail.component.css',
})
export class SalesDetailComponent {
  saleId: number | null = null;
  saleProducts: SaleProduct[] = [];
  pendingProducts: SaleProduct[] = [];
  allProducts: Product[] = [];
  filteredProducts: Product[] = [];

  sale: Sale = {
    tableNumber: 0,
    clientId: '',
    status: '',
    products: [],
  };

  loading: boolean = true;
  searchTerm = '';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private productsService: ProductsService,
    private salesService: SalesService
  ) {}

  ngOnInit(): void {
    this.saleId = Number(this.route.snapshot.paramMap.get('id'));
    if (this.saleId) {
      this.getSaleById(this.saleId);
    }
    this.loadProducts();
  }

  getSaleById(id: number) {
    this.salesService.getSaleById(id).subscribe((sale) => {
      this.sale = sale ?? [];
      this.loading = false;
      if (this.sale?.products) {
        this.saleProducts = this.sale.products;
        console.log('this.sale.products', this.sale.products);
      }
    });
  }

  loadProducts() {
    this.productsService.getProducts().subscribe((products) => {
      this.allProducts = products ?? [];
      this.filteredProducts = [...this.allProducts];
    });
  }

  commitProducts(): void {
    if (this.pendingProducts.length === 0) return;
    console.log('Products added:', this.pendingProducts);
    try {
      this.pendingProducts.forEach((pending) => {
        console.log('pending: ', pending);
        this.salesService
          .addProductToSale(pending.id ?? 0, this.saleId!, pending.quantity)
          .subscribe(() => {
            const existing = this.saleProducts.find(
              (p) => p.name === pending.name
            );
            if (existing) {
              existing.quantity += pending.quantity;
            } else {
              this.saleProducts.push({ ...pending });
            }
          });
      });
      this.pendingProducts = [];
    } catch (error) {
      console.log('Error adding products to sale:', error);
    }
  }

  addProductToPending(product: Product): void {
    const existing = this.pendingProducts.find((p) => p.name === product.name);
    if (existing) {
      existing.quantity += 1;
    } else {
      this.pendingProducts.push({
        id: product.id,
        saleId: this.saleId || 0,
        name: product.name,
        price: product.price,
        category: product.category,
        quantity: 1,
        clientId: 'bahia-escondida',
      });
    }
  }

  removePendingProduct(name: string): void {
    const existing = this.pendingProducts.find((p) => p.name === name);

    if (existing) {
      if (existing.quantity > 1) {
        existing.quantity -= 1;
      } else {
        this.pendingProducts = this.pendingProducts.filter(
          (p) => p.name !== name
        );
      }
    }
  }

  searchProducts(): void {
    const term = this.searchTerm.toLowerCase();
    this.filteredProducts = this.allProducts.filter((p) =>
      p.name.toLowerCase().includes(term)
    );
  }

  navigateToSales() {
    this.router.navigate(['/sales']);
  }

  pendingProductsTotal(): number {
    return this.pendingProducts.reduce(
      (sum, p) => sum + p.price * p.quantity,
      0
    );
  }

  totalProductsPrice(): number {
    return this.saleProducts.reduce((sum, p) => sum + p.price * p.quantity, 0);
  }

  printSale() {
    const sale = this.sale;
    const subtotal = sale.products.reduce(
      (sum: number, p: any) => sum + p.price * p.quantity,
      0
    );

    const tip = Math.round(subtotal * 0.1); // 10% tip
    const total = subtotal + tip;

    const productsHtml = sale.products
      .map(
        (p: any) => `
          <div class="row">
            <span>${p.name} x${p.quantity}</span>
            <span>$${(p.price * p.quantity).toLocaleString('es-CL')}</span>
          </div>
        `
      )
      .join('');

    const html = `
      <html>
        <head>
          <title>Receipt</title>
          <style>
            body {
              width: 80mm;
              font-family: monospace;
              font-size: 12px;
              margin: 0;
            }
  
            .center {
              text-align: center;
            }
  
            .line {
              border-top: 1px dashed #000;
              margin: 6px 0;
            }
  
            .row {
              display: flex;
              justify-content: space-between;
              margin: 2px 0;
            }
  
            .total {
              font-size: 14px;
              font-weight: bold;
            }
  
            .muted {
              opacity: 0.8;
            }
          </style>
        </head>
  
        <body onload="window.print(); window.close();">
          <h2 class="center">${sale.clientId.toUpperCase()}</h2>
  
          <div class="line"></div>
  
          <p>Mesa: ${sale.tableNumber}</p>
          <p>Fecha: ${sale.createdAt}</p>
          <p>Venta #: ${sale.id}</p>
  
          <div class="line"></div>
  
          ${productsHtml}
  
          <div class="line"></div>
  
          <div class="row muted">
            <span>Subtotal</span>
            <span>$${subtotal.toLocaleString('es-CL')}</span>
          </div>
  
          <div class="row muted">
            <span>Propina (10%)</span>
            <span>$${tip.toLocaleString('es-CL')}</span>
          </div>
  
          <div class="line"></div>
  
          <div class="row total">
            <span>TOTAL</span>
            <span>$${total.toLocaleString('es-CL')}</span>
          </div>
  
          <div class="line"></div>
  
          <p class="center">Gracias por su compra</p>
        </body>
      </html>
    `;

    const printWindow = window.open('', '_blank', 'width=400,height=600');
    printWindow!.document.write(html);
    printWindow!.document.close();
  }

  closeTable() {
    this.salesService.closeSale(this.saleId!).subscribe(() => {
      this.navigateToSales();
    });
  }
}
