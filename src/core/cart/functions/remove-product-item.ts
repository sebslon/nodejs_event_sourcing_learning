import { PricedProductItem } from '../product-item.interface';

export function removeProductItem(
  productItems: PricedProductItem[],
  productItemToRemove: PricedProductItem,
): PricedProductItem[] {
  const { productId, quantity, unitPrice } = productItemToRemove;

  const existingItem = productItems.find(
    (p) => p.productId === productId && p.unitPrice === unitPrice,
  );

  if (!existingItem) {
    return productItems;
  }

  const newQuantity = existingItem.quantity - quantity;

  if (newQuantity <= 0) {
    return productItems.filter(
      (p) => p.productId !== productId || p.unitPrice !== unitPrice,
    );
  }

  const newItem = { ...existingItem, quantity: newQuantity };

  return productItems.map((p) => (p.productId === productId ? newItem : p));
}
