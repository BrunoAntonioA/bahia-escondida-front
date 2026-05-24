export type ProductCategory = 'FOOD' | 'DRINK';

export interface ProductCategoryOption {
  value: ProductCategory;
  label: string;
}

export const PRODUCT_CATEGORY_OPTIONS: ProductCategoryOption[] = [
  { value: 'FOOD', label: 'Comida' },
  { value: 'DRINK', label: 'Bebestible' },
];

const CATEGORY_LABELS: Record<string, string> = {
  FOOD: 'Comida',
  DRINK: 'Bebestible',
  COMIDA: 'Comida',
  BEBESTIBLE: 'Bebestible',
  Comida: 'Comida',
  Bebestible: 'Bebestible',
};

export function getCategoryLabel(
  category: string | undefined | null,
): string {
  if (!category) return '';
  return CATEGORY_LABELS[category] ?? CATEGORY_LABELS[category.toUpperCase()] ?? category;
}

export function normalizeKitchenCategoryKey(
  category: string | undefined | null,
): 'COMIDA' | 'BEBESTIBLE' | null {
  if (!category) return null;

  const upper = category.toUpperCase();

  if (upper === 'FOOD' || upper === 'COMIDA') return 'COMIDA';
  if (upper === 'DRINK' || upper === 'DRINKS' || upper === 'BEBESTIBLE') {
    return 'BEBESTIBLE';
  }

  return null;
}
