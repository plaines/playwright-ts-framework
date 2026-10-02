import { APIRequestContext, APIResponse } from '@playwright/test';
import { API_ROUTES } from '../../configs/constants';
import { LoginRequest, ProductPayload } from './models';

export class FakeStoreClient {
  /** Static: the same headers for every instance, so they belong to the class, not to each object. */
  private static readonly JSON_HEADERS = { 'Content-Type': 'application/json', Accept: 'application/json' };

  /** Instance: each test receives its own request context (Playwright's `request` fixture). */
  constructor(private readonly request: APIRequestContext) {}

  getProduct(id: number): Promise<APIResponse> {
    return this.send('GET', `${API_ROUTES.products}/${id}`);
  }

  createProduct(payload: ProductPayload): Promise<APIResponse> {
    return this.send('POST', API_ROUTES.products, payload);
  }

  login(credentials: LoginRequest): Promise<APIResponse> {
    return this.send('POST', API_ROUTES.login, credentials);
  }

  private async send(method: string, url: string, body?: unknown): Promise<APIResponse> {
    try {
      return await this.request.fetch(url, {
        method,
        headers: FakeStoreClient.JSON_HEADERS,
        data: body === undefined ? undefined : JSON.stringify(body),
      });
    } catch (error) {
      // Error translation: network errors become a readable message, and the test still fails.
      throw new Error(`[FakeStore] ${method} ${url} failed: ${(error as Error).message}`, { cause: error });
    }
  }
}
