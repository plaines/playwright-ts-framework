import { z } from 'zod';

/** Schemas validate the response at runtime; `z.infer` gives the matching TypeScript types. */
export const ProductSchema = z.object({
  id: z.number().int().positive(),
  title: z.string().min(1),
  price: z.number().nonnegative(),
  description: z.string(),
  category: z.string(),
  image: z.string(),
  rating: z.object({ rate: z.number(), count: z.number().int() }).optional(),
});
export type Product = z.infer<typeof ProductSchema>;

export type NewProduct = Omit<Product, 'id' | 'rating'>;

export type LoginRequest = { username: string; password: string };

/**
 * Request model for POST /products.
 * The constructor guarantees a valid object; price is encapsulated behind a validating setter.
 */
export class ProductPayload {
  private _price: number;

  constructor(private readonly data: Omit<NewProduct, 'price'> & { price: number }) {
    if (!data.title.trim()) throw new Error('Product title is required');
    this._price = ProductPayload.validatePrice(data.price);
  }

  get price(): number {
    return this._price;
  }

  set price(value: number) {
    this._price = ProductPayload.validatePrice(value);
  }

  get title(): string {
    return this.data.title;
  }

  /** Called by JSON.stringify: this is what gets serialized into the request body. */
  toJSON(): NewProduct {
    return { ...this.data, price: this._price };
  }

  private static validatePrice(value: number): number {
    if (!Number.isFinite(value) || value <= 0) throw new Error(`Invalid price: ${value}`);
    return value;
  }
}
