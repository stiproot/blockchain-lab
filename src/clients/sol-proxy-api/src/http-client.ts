export class HttpClient {
  private readonly _baseUrl: string | null;
  private headers: Record<string, string>;

  constructor(baseUrl: string | null = null, headers: Record<string, string> = {}) {
    this._baseUrl = baseUrl;
    this.headers = headers;
  }

  private async request<T>(
    method: string,
    endpoint: string,
    body?: any
  ): Promise<T> {
    const url = this._baseUrl ? `${this._baseUrl}/${endpoint}` : endpoint;
    const response = await fetch(url, {
      method,
      headers: {
        "Content-Type": "application/json",
        ...this.headers,
      },
      body: body ? JSON.stringify(body) : undefined,
    });

    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    return response.json() as Promise<T>;
  }

  get<T>(endpoint: string): Promise<T> {
    return this.request<T>("GET", endpoint);
  }

  post<T>(endpoint: string, body: any): Promise<T> {
    return this.request<T>("POST", endpoint, body);
  }

  put<T>(endpoint: string, body: any): Promise<T> {
    return this.request<T>("PUT", endpoint, body);
  }

  delete<T>(endpoint: string): Promise<T> {
    return this.request<T>("DELETE", endpoint);
  }
}
