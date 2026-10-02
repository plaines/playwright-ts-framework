import { ProductPayload } from '../../utils/api/models';
import { expect, test } from '../../utils/fixtures';

// Pure unit tests for the request model: no browser or network needed.
test.describe('ProductPayload model', () => {
  const valid = { title: 'Pen', price: 2, description: 'Blue pen', category: 'office', image: 'https://i.pravatar.cc' };

  test('constructor rejects an invalid object', () => {
    expect(() => new ProductPayload({ ...valid, price: -1 })).toThrow('Invalid price');
    expect(() => new ProductPayload({ ...valid, title: ' ' })).toThrow('title is required');
  });

  test('price setter keeps the object valid and is serialized', () => {
    const payload = new ProductPayload(valid);

    payload.price = 3.5;
    expect(() => (payload.price = 0)).toThrow('Invalid price');

    expect(JSON.parse(JSON.stringify(payload))).toEqual({ ...valid, price: 3.5 });
  });
});
