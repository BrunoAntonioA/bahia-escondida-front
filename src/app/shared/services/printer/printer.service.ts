import { Injectable } from '@angular/core';
import { AuthService } from '../../../auth/services/auth.service';
import { normalizeKitchenCategoryKey } from '../../constants/product-categories';
import { Sale, SaleProductLine } from '../../models/sales';

type KitchenSection = 'COMIDA' | 'BEBESTIBLE';

interface KitchenPrintOptions {
  sections: KitchenSection[];
}

@Injectable({
  providedIn: 'root',
})
export class PrinterService {
  constructor(private authService: AuthService) {}

  // ---------- OPEN SALES ----------

  printOpenSales(sales: Sale[]): void {
    const openSales = sales.filter((sale) => sale.status === 'abierta');
    if (!openSales.length) return;

    const content = this.buildOpenSalesReport(openSales);
    if (!content.trim()) return;

    const html = this.buildOpenSalesHtml(content);
    this.openPrintWindow(html, 420, 720);
  }

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
    sale: Sale,
    options: KitchenPrintOptions = { sections: ['COMIDA', 'BEBESTIBLE'] },
  ) {
    this.printKitchenSales([sale], options);
  }

  printKitchenSales(
    sales: Sale[],
    options: KitchenPrintOptions = { sections: ['COMIDA', 'BEBESTIBLE'] },
  ) {
    const content = sales
      .map((sale) => this.buildKitchenTicket(sale, options))
      .join('');

    if (!content.trim()) return;

    const html = this.buildKitchenHtml(content);
    this.openPrintWindow(html, 380, 600);
  }

  private buildOpenSalesReport(sales: Sale[]): string {
    const tableSales = sales
      .filter((sale) => !sale.isDelivery)
      .sort((a, b) => (a.tableNumber ?? 0) - (b.tableNumber ?? 0));
    const deliverySales = sales
      .filter((sale) => sale.isDelivery)
      .sort((a, b) =>
        (a.customerNickname ?? '').localeCompare(b.customerNickname ?? '', 'es'),
      );

    const { formattedDate, formattedTime } = this.formatDateTime(
      new Date().toISOString(),
    );
    const clientName = this.authService.getClientName() || 'Panel de ventas';

    const header = `
      <div class="report">
        <div class="report-title">${this.escapeHtml(clientName.toUpperCase())}</div>
        <div class="report-subtitle">VENTAS ABIERTAS</div>
        <div class="report-meta">
          <span>${formattedDate}</span>
          <span>${formattedTime}</span>
        </div>
        <div class="report-count">
          ${tableSales.length} mesa(s) · ${deliverySales.length} delivery
        </div>
        <div class="divider"></div>
    `;

    const tableSection = this.buildOpenSalesSection('MESAS', tableSales);
    const deliverySection = this.buildOpenSalesSection('DELIVERY', deliverySales);

    return `${header}${tableSection}${deliverySection}</div>`;
  }

  private buildOpenSalesSection(title: string, sales: Sale[]): string {
    if (!sales.length) return '';

    const blocks = sales.map((sale) => this.buildOpenSaleBlock(sale)).join('');

    return `
      <div class="section">
        <div class="section-title">${title}</div>
        ${blocks}
      </div>
    `;
  }

  private buildOpenSaleBlock(sale: Sale): string {
    const { formattedTime } = this.formatDateTime(
      typeof sale.createdAt === 'string' ? sale.createdAt : undefined,
    );

    const heading = sale.isDelivery
      ? this.escapeHtml(sale.customerNickname?.trim() || 'Delivery')
      : `MESA ${sale.tableNumber ?? '—'}`;

    const products = sale.products ?? [];
    const productsHtml =
      products.length > 0
        ? `<div class="items">${products
            .map((line) => this.buildKitchenProductHtml(line))
            .join('')}</div>`
        : `<p class="empty">Sin productos agregados</p>`;

    return `
      <div class="sale-block">
        <div class="sale-header">
          <span class="sale-heading">${heading}</span>
          <span class="sale-meta">#${sale.id ?? ''}${formattedTime ? ` · ${formattedTime}` : ''}</span>
        </div>
        ${productsHtml}
      </div>
    `;
  }

  private buildOpenSalesHtml(content: string): string {
    return `
      <!DOCTYPE html>
      <html>
        <head><meta charset="utf-8" /><style>${this.openSalesStyles()}</style></head>
        <body onload="window.print(); window.close();">${content}</body>
      </html>
    `;
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
      .map((p: any) => {
        const optionsTotal = (p.selectedOptions ?? []).reduce(
          (sum: number, option: any) => sum + (option.price ?? 0),
          0,
        );
        const lineTotal = (p.price + optionsTotal) * p.quantity;
        const optionsHtml = (p.selectedOptions ?? [])
          .map(
            (option: any) =>
              `<div class="option">· ${option.optionName ?? option.name}</div>`,
          )
          .join('');

        return `
          <div class="item">
            <div class="row">
              <span class="name">${p.name} x${p.quantity}</span>
              <span class="price">$${lineTotal.toLocaleString('es-CL')}</span>
            </div>
            ${optionsHtml}
          </div>
        `;
      })
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

  private buildKitchenTicket(sale: Sale, options: KitchenPrintOptions): string {
    if (!sale?.products?.length) return '';

    const headerTitle =
      sale.tableNumber !== 0
        ? `MESA ${sale.tableNumber}`
        : `PARA LLEVAR: ${sale.customerNickname || sale.clientId}`;

    const productsByCategory = this.groupProductsByCategory(sale.products);
    const showCategoryTitle = options.sections.length > 1;
    const metaHtml = this.buildKitchenMeta(sale);

    return options.sections
      .map((section) =>
        this.buildKitchenSection(
          headerTitle,
          metaHtml,
          section,
          productsByCategory[section],
          showCategoryTitle,
        ),
      )
      .join('');
  }

  private buildKitchenMeta(sale: Sale): string {
    const { formattedTime } = this.formatDateTime(
      typeof sale.createdAt === 'string' ? sale.createdAt : undefined,
    );

    return `
      <div class="meta">
        <span>Comanda #${sale.id ?? ''}</span>
        ${formattedTime ? `<span>${formattedTime}</span>` : ''}
      </div>
    `;
  }

  private buildKitchenSection(
    headerTitle: string,
    metaHtml: string,
    section: KitchenSection,
    products: SaleProductLine[] | undefined,
    showCategoryTitle: boolean,
  ): string {
    if (!products?.length) return '';

    switch (section) {
      case 'COMIDA':
        return this.buildComidaSection(
          headerTitle,
          metaHtml,
          products,
          showCategoryTitle,
        );

      case 'BEBESTIBLE':
        return this.buildBebestibleSection(
          headerTitle,
          metaHtml,
          products,
          showCategoryTitle,
        );

      default:
        return '';
    }
  }

  private buildComidaSection(
    headerTitle: string,
    metaHtml: string,
    products: SaleProductLine[],
    showCategoryTitle: boolean,
  ): string {
    return this.buildKitchenSectionHtml(
      headerTitle,
      metaHtml,
      'COMIDA',
      products,
      showCategoryTitle,
    );
  }

  private buildBebestibleSection(
    headerTitle: string,
    metaHtml: string,
    products: SaleProductLine[],
    showCategoryTitle: boolean,
  ): string {
    return this.buildKitchenSectionHtml(
      headerTitle,
      metaHtml,
      'BEBESTIBLE',
      products,
      showCategoryTitle,
    );
  }

  private buildKitchenProductHtml(line: SaleProductLine): string {
    const options = line.selectedOptions ?? [];
    const optionsHtml =
      options.length > 0
        ? `
          <ul class="options">
            ${options
              .map(
                (option) =>
                  `<li>${this.escapeHtml(option.optionName)}</li>`,
              )
              .join('')}
          </ul>
        `
        : '';

    return `
      <div class="item">
        <div class="item-header">
          <span class="qty">x${line.quantity}</span>
          <span class="name">${this.escapeHtml(line.name)}</span>
        </div>
        ${optionsHtml}
      </div>
    `;
  }

  private buildKitchenSectionHtml(
    headerTitle: string,
    metaHtml: string,
    title: string,
    products: SaleProductLine[],
    showCategoryTitle: boolean,
  ): string {
    return `
    <div class="ticket">
      <div class="header">${this.escapeHtml(headerTitle)}</div>
      ${metaHtml}
      <div class="divider"></div>

      ${showCategoryTitle ? `<div class="category">${title}</div>` : ''}

      <div class="items">
        ${products.map((line) => this.buildKitchenProductHtml(line)).join('')}
      </div>
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

  private groupProductsByCategory(products: SaleProductLine[]) {
    return products.reduce(
      (acc: Partial<Record<KitchenSection, SaleProductLine[]>>, product) => {
        const key = normalizeKitchenCategoryKey(product.category);
        if (!key) return acc;
        acc[key] ??= [];
        acc[key]!.push(product);
        return acc;
      },
      {},
    );
  }

  private escapeHtml(value: string): string {
    return value
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
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
    return products.reduce((sum, p) => {
      const optionsTotal = (p.selectedOptions ?? []).reduce(
        (optionSum: number, option: any) => optionSum + (option.price ?? 0),
        0,
      );
      return sum + (p.price + optionsTotal) * p.quantity;
    }, 0);
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

    .item {
      margin: 2px 0;
    }

    .option {
      margin-left: 8px;
      font-size: 13px;
    }

    .cut {
      border-top: 2px dashed #000;
      margin: 10px 0;
    }
  `;
  }

  private openSalesStyles(): string {
    return `
      ${this.kitchenStyles()}

      .report {
        padding-bottom: 8px;
      }

      .report-title {
        text-align: center;
        font-size: 20px;
        font-weight: bold;
        letter-spacing: 0.04em;
      }

      .report-subtitle {
        text-align: center;
        font-size: 22px;
        font-weight: bold;
        margin-top: 4px;
      }

      .report-meta {
        display: flex;
        justify-content: space-between;
        gap: 8px;
        margin-top: 8px;
        font-size: 14px;
      }

      .report-count {
        text-align: center;
        margin-top: 6px;
        font-size: 15px;
        font-weight: bold;
      }

      .section {
        margin-top: 12px;
      }

      .section-title {
        text-align: center;
        font-size: 17px;
        font-weight: bold;
        letter-spacing: 0.1em;
        margin: 10px 0 8px;
        padding: 4px 0;
        border-top: 1px dashed #000;
        border-bottom: 1px dashed #000;
      }

      .sale-block {
        margin: 10px 0;
        padding-bottom: 10px;
        border-bottom: 1px dashed #bbb;
      }

      .sale-block:last-child {
        border-bottom: none;
        padding-bottom: 0;
      }

      .sale-header {
        display: flex;
        flex-direction: column;
        gap: 2px;
        margin-bottom: 6px;
      }

      .sale-heading {
        font-size: 20px;
        font-weight: bold;
        line-height: 1.2;
      }

      .sale-meta {
        font-size: 13px;
      }

      .empty {
        margin: 4px 0 0 2.4em;
        font-size: 15px;
        font-style: italic;
      }
    `;
  }

  private kitchenStyles(): string {
    return `
      @page { size: 80mm auto; margin: 0; }

      html, body {
        width: 80mm;
        margin: 0;
        padding: 6px;
        font-family: monospace;
        font-size: 18px;
        color: #000;
      }

      .ticket {
        padding-bottom: 4px;
      }

      .header {
        text-align: center;
        font-size: 24px;
        font-weight: bold;
        line-height: 1.2;
        letter-spacing: 0.02em;
      }

      .meta {
        display: flex;
        justify-content: space-between;
        gap: 8px;
        margin-top: 6px;
        font-size: 14px;
      }

      .divider {
        border-top: 1px dashed #000;
        margin: 8px 0;
      }

      .category {
        text-align: center;
        font-size: 17px;
        font-weight: bold;
        margin: 0 0 8px;
        letter-spacing: 0.08em;
      }

      .items {
        display: flex;
        flex-direction: column;
        gap: 10px;
      }

      .item {
        padding-bottom: 8px;
        border-bottom: 1px dashed #bbb;
      }

      .item:last-child {
        border-bottom: none;
        padding-bottom: 0;
      }

      .item-header {
        display: flex;
        align-items: flex-start;
        gap: 8px;
        font-weight: bold;
        line-height: 1.25;
      }

      .qty {
        flex-shrink: 0;
        min-width: 2.2em;
      }

      .name {
        flex: 1;
        min-width: 0;
        word-break: break-word;
      }

      .options {
        margin: 6px 0 0 2.4em;
        padding: 0;
        list-style: none;
      }

      .options li {
        position: relative;
        margin: 3px 0;
        padding-left: 12px;
        font-size: 16px;
        line-height: 1.25;
        word-break: break-word;
      }

      .options li::before {
        content: "›";
        position: absolute;
        left: 0;
        top: 0;
        font-weight: bold;
      }

      .cut {
        border-top: 2px dashed #000;
        margin: 12px 0;
      }
    `;
  }
}
