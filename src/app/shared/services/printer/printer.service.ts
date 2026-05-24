import { Injectable } from '@angular/core';
import { normalizeKitchenCategoryKey } from '../../constants/product-categories';

type KitchenSection = 'COMIDA' | 'BEBESTIBLE';

interface KitchenPrintOptions {
  sections: KitchenSection[];
}

@Injectable({
  providedIn: 'root',
})
export class PrinterService {
  // ---------- RECEIPTS ----------

  printSale(sale: any) {
    this.printSales([sale]);
  }

  printSales(sales: any[]) {
    const content = sales.map((s) => this.buildSaleReceipt(s)).join('');
    if (!content.trim()) return;

    const html = this.buildReceiptHtml(content);
    this.openPrintWindow(html, 380, 600);
  }

  // ---------- KITCHEN ----------

  printKitchenSale(
    sale: any,
    options: KitchenPrintOptions = { sections: ['COMIDA', 'BEBESTIBLE'] },
  ) {
    this.printKitchenSales([sale], options);
  }

  printKitchenSales(
    sales: any[],
    options: KitchenPrintOptions = { sections: ['COMIDA', 'BEBESTIBLE'] },
  ) {
    const content = sales
      .map((sale) => this.buildKitchenTicket(sale, options))
      .join('');

    if (!content.trim()) return;

    const html = this.buildKitchenHtml(content);
    this.openPrintWindow(html, 380, 600);
  }

  /* =======================
   * RECEIPT (SINGLE SALE)
   * ======================= */

  private buildSaleReceipt(sale: any): string {
    if (!sale?.products?.length) return '';

    const { formattedDate, formattedTime } = this.formatDateTime(
      sale.createdAt,
    );
    const subtotal = this.calculateSubtotal(sale.products);
    const tip = Math.round(subtotal * 0.1);
    const total = subtotal + tip;

    const productsHtml = sale.products
      .map(
        (p: any) => `
          <div class="row">
            <span class="name">${p.name} x${p.quantity}</span>
            <span class="price">$${(p.price * p.quantity).toLocaleString('es-CL')}</span>
          </div>
        `,
      )
      .join('');

    return `
      <div class="receipt">
        <div class="center"><strong>${String(sale.clientId ?? '').toUpperCase()}</strong></div>

        <div class="line"></div>

        <div>${
          sale.tableNumber !== 0
            ? `Mesa: ${sale.tableNumber}`
            : `Cliente: ${sale.customerNickname}`
        }</div>

        ${
          formattedDate && formattedTime
            ? `<div>Fecha: ${formattedDate}</div><div>Hora: ${formattedTime}</div>`
            : ''
        }

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

        <div class="cut"></div>
      </div>
    `;
  }

  /* =======================
   * KITCHEN (MODULAR)
   * ======================= */

  private buildKitchenTicket(sale: any, options: KitchenPrintOptions): string {
    if (!sale?.products?.length) return '';

    const headerTitle =
      sale.tableNumber !== 0
        ? `MESA ${sale.tableNumber}`
        : `PARA LLEVAR: ${sale.customerNickname || sale.clientId}`;

    const productsByCategory = this.groupProductsByCategory(sale.products);

    const showCategoryTitle = options.sections.length > 1;

    return options.sections
      .map((section) =>
        this.buildKitchenSection(
          headerTitle,
          section,
          productsByCategory[section],
          showCategoryTitle,
        ),
      )
      .join('');
  }

  private buildKitchenSection(
    headerTitle: string,
    section: KitchenSection,
    products: any[] | undefined,
    showCategoryTitle: boolean,
  ): string {
    if (!products?.length) return '';

    switch (section) {
      case 'COMIDA':
        return this.buildComidaSection(
          headerTitle,
          products,
          showCategoryTitle,
        );

      case 'BEBESTIBLE':
        return this.buildBebestibleSection(
          headerTitle,
          products,
          showCategoryTitle,
        );

      default:
        return '';
    }
  }

  private buildComidaSection(
    headerTitle: string,
    products: any[],
    showCategoryTitle: boolean,
  ): string {
    return this.buildKitchenSectionHtml(
      headerTitle,
      'COMIDA',
      products,
      showCategoryTitle,
    );
  }

  private buildBebestibleSection(
    headerTitle: string,
    products: any[],
    showCategoryTitle: boolean,
  ): string {
    return this.buildKitchenSectionHtml(
      headerTitle,
      'BEBESTIBLE',
      products,
      showCategoryTitle,
    );
  }

  private buildKitchenSectionHtml(
    headerTitle: string,
    title: string,
    products: any[],
    showCategoryTitle: boolean,
  ): string {
    return `
    <div class="ticket">
      <div class="header">${headerTitle}</div>

      ${showCategoryTitle ? `<div class="category">${title}</div>` : ''}

      ${products
        .map(
          (p) => `
            <div class="product">
              <span class="qty">x${p.quantity}</span>
              <span class="name">${p.name}</span>
            </div>
          `,
        )
        .join('')}
    </div>

    <div class="cut"></div>
  `;
  }

  /* =======================
   * HTML WRAPPERS
   * ======================= */

  private buildReceiptHtml(content: string): string {
    return `
      <!DOCTYPE html>
      <html>
        <head><meta charset="utf-8" /><style>${this.receiptStyles()}</style></head>
        <body onload="window.print(); window.close();">${content}</body>
      </html>
    `;
  }

  private buildKitchenHtml(content: string): string {
    return `
      <!DOCTYPE html>
      <html>
        <head><meta charset="utf-8" /><style>${this.kitchenStyles()}</style></head>
        <body onload="window.print(); window.close();">${content}</body>
      </html>
    `;
  }

  /* =======================
   * HELPERS
   * ======================= */

  private groupProductsByCategory(products: any[]) {
    return products.reduce((acc: any, p: any) => {
      const key = normalizeKitchenCategoryKey(p.category);
      if (!key) return acc;
      acc[key] ??= [];
      acc[key].push(p);
      return acc;
    }, {});
  }

  private formatDateTime(dateValue?: string) {
    if (!dateValue) return { formattedDate: '', formattedTime: '' };

    const date = new Date(dateValue);
    if (isNaN(date.getTime())) return { formattedDate: '', formattedTime: '' };

    return {
      formattedDate: date.toLocaleDateString('es-CL', {
        day: '2-digit',
        month: '2-digit',
        year: '2-digit',
      }),
      formattedTime: date.toLocaleTimeString('es-CL', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false,
      }),
    };
  }

  private calculateSubtotal(products: any[]) {
    return products.reduce((sum, p) => sum + p.price * p.quantity, 0);
  }

  private openPrintWindow(html: string, width = 600, height = 600) {
    const win = window.open('', '_blank', `width=${width},height=${height}`);
    if (!win) return;
    win.document.write(html);
    win.document.close();
  }

  /* =======================
   * STYLES (unchanged)
   * ======================= */

  private receiptStyles(): string {
    return `
    @page { size: 80mm auto; margin: 0; }

    html, body {
      width: 80mm;
      margin: 0;
      font-family: monospace;
      font-size: 16px;
    }

    .center { text-align: center; }

    .line {
      border-top: 1px dashed #000;
      margin: 4px 0;
    }

    .row {
      display: flex;
      align-items: flex-start;
      justify-content: space-between;
      gap: 6px;
      margin: 2px 0;
    }

    .name {
      flex: 1;               /* takes remaining space */
      word-break: break-word; 
    }

    .price {
      white-space: nowrap;   /* prevents price from breaking */
      text-align: right;
      flex-shrink: 0;        /* prevents shrinking */
    }

    .total {
      font-weight: bold;
      font-size: 18px;
    }

    .cut {
      border-top: 2px dashed #000;
      margin: 10px 0;
    }
  `;
  }

  private kitchenStyles(): string {
    return `
      @page { size: 80mm auto; margin: 0; }
      body { width: 80mm; margin: 0; padding: 4px; font-family: monospace; font-size: 20px; }
      .header { text-align: center; font-size: 22px; font-weight: bold; }
      .category { text-align: center; font-size: 18px; font-weight: bold; margin-bottom: 6px; }
      .product { display: flex; gap: 6px; margin: 4px 0; }
      .qty { font-weight: bold; }
      .name { word-break: break-word; }
      .cut { border-top: 2px dashed #000; margin: 10px 0; }
    `;
  }
}
