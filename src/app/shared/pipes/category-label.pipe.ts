import { Pipe, PipeTransform } from '@angular/core';
import { getCategoryLabel } from '../constants/product-categories';

@Pipe({
  name: 'categoryLabel',
  standalone: true,
})
export class CategoryLabelPipe implements PipeTransform {
  transform(value: string | undefined | null): string {
    return getCategoryLabel(value);
  }
}
