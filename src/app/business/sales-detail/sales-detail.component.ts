import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Product, SaleProduct } from '../../shared/models/product';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Sale } from '../../shared/models/sales';
import { ProductsService } from '../../shared/services/products.service';
import { SalesService } from '../../shared/services/sales/sales.service';
import { PaymentsService } from '../../shared/services/payments/payments.service';
import { PrinterService } from '../../shared/services/printer/printer.service';
import { switchMap, tap } from 'rxjs';

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
  showCloseModal = false;

  payment = {
    efectivo: 0,
    tarjeta: 0,
  };

  sale: Sale = {
    tableNumber: 0,
    isDelivery: false,
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
    private salesService: SalesService,
    private paymentsService: PaymentsService,
    private printerService: PrinterService
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
    try {
      this.pendingProducts.forEach((pending) => {
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
    this.router.navigate(['/ventas']);
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

    const tip = Math.round(subtotal * 0.1);
    const total = subtotal + tip;

    const productsHtml = sale.products
      .map(
        (p: any) => `
        <div class="row">
          <span class="name">${p.name} x${p.quantity}</span>
          <span class="price">$${(p.price * p.quantity).toLocaleString(
            'es-CL'
          )}</span>
        </div>
      `
      )
      .join('');

    const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8" />
      <title>Receipt</title>
      <style>
        @page {
          size: 50mm auto;
          margin: 0;
        }

        html, body {
          width: 50mm;
          margin: 0;
          padding: 0;
          font-family: monospace;
          font-size: 14px;
          height: auto;
        }

        * {
          box-sizing: border-box;
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
          align-items: flex-start;
          margin: 2px 0;
          gap: 6px;
        }

        .name {
          max-width: 38mm;
          word-wrap: break-word;
        }

        .price {
          white-space: nowrap;
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
      <div class="center">
        <strong>${sale.clientId.toUpperCase()}</strong>
      </div>

      <div class="line"></div>

      <div>${
        sale.tableNumber !== 0
          ? 'Mesa: ' + sale.tableNumber
          : 'Cliente: ' + sale.customerNickname
      }</div>
      <div>Fecha: ${sale.createdAt}</div>
      <div>Venta #: ${sale.id}</div>

      <div class="line"></div>

      ${productsHtml}

      <div class="line"></div>

      <div class="row">
        <span>Subtotal</span>
        <span>$${subtotal.toLocaleString('es-CL')}</span>
      </div>

      <div class="row">
        <span>Propina (10%)</span>
        <span>$${tip.toLocaleString('es-CL')}</span>
      </div>

      <div class="line"></div>

      <div class="row total">
        <span>TOTAL</span>
        <span>$${total.toLocaleString('es-CL')}</span>
      </div>

      <div class="line"></div>

      <div class="center">
        Gracias por su compra
      </div>
    </body>
    </html>
    `;

    const printWindow = window.open('', '_blank', 'width=380,height=600');
    printWindow!.document.write(html);
    printWindow!.document.close();
  }

  printKitchen() {
    const sale = this.sale;

    const headerTitle =
      sale.tableNumber !== 0
        ? `MESA ${sale.tableNumber}`
        : `PARA LLEVAR: ${sale.customerNickname || sale.clientId}`;

    const productsByCategory = sale.products.reduce((acc: any, p: any) => {
      if (!acc[p.category]) acc[p.category] = [];
      acc[p.category].push(p);
      return acc;
    }, {});

    const kitchenProductsHtml = Object.entries(productsByCategory)
      .map(
        ([category, products]: any) => `
      <div class="ticket">
        <div class="header">${headerTitle}</div>
        <div class="category">${category.toUpperCase()}</div>

        ${products
          .map(
            (p: any) => `
              <div class="product">
                <span class="qty">x${p.quantity}</span>
                <span class="name">${p.name}</span>
              </div>
            `
          )
          .join('')}
      </div>

      <div class="cut"></div>
    `
      )
      .join('');

    const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8" />
      <style>
        @page {
          size: 50mm auto;
          margin: 0;
        }

        body {
          width: 50mm;
          margin: 0;
          padding: 4px;
          font-family: monospace;
          font-size: 20px;
        }

        .ticket {
          margin-bottom: 10px;
        }

        .header {
          text-align: center;
          font-size: 22px;
          font-weight: bold;
          margin-bottom: 4px;
        }

        .category {
          text-align: center;
          font-size: 18px;
          font-weight: bold;
          margin-bottom: 6px;
        }

        .product {
          display: flex;
          gap: 6px;
          margin: 4px 0;
        }

        .qty {
          font-weight: bold;
        }

        .name {
          word-break: break-word;
        }

        .cut {
          border-top: 2px dashed #000;
          margin: 10px 0;
        }
      </style>
    </head>

    <body onload="window.print(); window.close();">
      ${kitchenProductsHtml}
    </body>
    </html>
  `;

    const printWindow = window.open('', '_blank', 'width=380,height=600');
    printWindow!.document.write(html);
    printWindow!.document.close();
  }

  openCloseModal() {
    this.payment = { efectivo: 0, tarjeta: 0 };
    this.showCloseModal = true;
  }

  confirmCloseSale() {
    const total = this.totalProductsPrice();
    const paid = this.payment.efectivo + this.payment.tarjeta;

    if (paid < total) {
      alert('El monto pagado es menor al total');
      return;
    }

    this.paymentsService
      .create(this.payment.efectivo, this.payment.tarjeta, this.saleId ?? 0)
      .pipe(
        switchMap(() => this.salesService.closeSale(this.saleId ?? 0)),
        tap(() => {
          this.showCloseModal = false;
          this.navigateToSales();
        })
      )
      .subscribe({
        error: (err) => {
          console.error(err);
        },
      });
  }

  closeTable() {
    this.salesService.closeSale(this.saleId!).subscribe(() => {
      this.navigateToSales();
    });
  }

  cancelCloseSale() {
    this.showCloseModal = false;
  }
}
