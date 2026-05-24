// pagination.component.ts
import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  Output,
} from '@angular/core';
import { buildPaginationView } from '../../utils/pagination.utils';

@Component({
  selector: 'app-pagination',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './pagination.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PaginationComponent {
  @Input({ required: true }) currentPage!: number;
  @Input({ required: true }) totalItems!: number;
  @Input() pageSize = 10;
  @Input() itemLabel = 'items';

  @Output() pageChange = new EventEmitter<number>();

  get view() {
    return buildPaginationView({
      currentPage: this.currentPage,
      pageSize: this.pageSize,
      totalItems: this.totalItems,
    });
  }

  goToPage(page: number): void {
    if (page === this.currentPage) return;
    if (page < 1 || page > this.view.totalPages) return;
    this.pageChange.emit(page);
  }

  prevPage(): void {
    this.goToPage(this.currentPage - 1);
  }

  nextPage(): void {
    this.goToPage(this.currentPage + 1);
  }
}
