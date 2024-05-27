import { PricedProductItem } from '../product-item.interface';

export function addProductItem(
  productItems: PricedProductItem[],
  newProductItem: PricedProductItem,
) {
  const { productId, quantity, unitPrice } = newProductItem;

  const existingItem = productItems.find(
    (p) => p.productId === productId && p.unitPrice === unitPrice,
  );

  if (!existingItem) {
    return [...productItems, newProductItem];
  }

  const newQuantity = existingItem.quantity + quantity;
  const newItem = { ...existingItem, quantity: newQuantity };

  return productItems.map((p) => (p.productId === productId ? newItem : p));
}
