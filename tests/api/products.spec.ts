import data from '../../test-data/api/products.json';
import { Product, ProductPayload, ProductSchema } from '../../utils/api/models';
import { expect, test } from '../../utils/fixtures';

test.describe('FakeStore API - products', () => {
  // Parameterized GET: one test per product in the data set.
  for (const { id, category } of data.existingProducts) {
    test(`GET /products/${id} returns a valid product`, async ({ fakeStore }) => {
      const response = await fakeStore.getProduct(id);

      expect(response.status()).toBe(200);
      const body: unknown = await response.json(); // deserialize
      expect(body).toMatchSchema(ProductSchema);

      const product = body as Product;
      expect(product.id).toBe(id);
      expect(product.category).toBe(category);
    });
  }

  // Parameterized POST with a JSON payload serialized from a typed model.
  for (const newProduct of data.newProducts) {
    test(`POST /products creates "${newProduct.title}"`, async ({ fakeStore }) => {
      const payload = new ProductPayload(newProduct);

      const response = await fakeStore.createProduct(payload);

      expect(response.status()).toBe(201);
      const body: unknown = await response.json();
      expect(body).toMatchSchema(ProductSchema);
      expect(body).toMatchObject(payload.toJSON());
    });
  }

  test('POST /auth/login with invalid credentials returns 401', async ({ fakeStore }) => {
    const { request, expectedStatus, expectedBody } = data.invalidLogin;

    const response = await fakeStore.login(request);

    expect(response.status()).toBe(expectedStatus);
    expect(await response.text()).toBe(expectedBody);
  });
});
