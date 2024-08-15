import { HttpClient } from '@/utils'

export abstract class EndpointClient {

  protected readonly httpClient: HttpClient

  constructor(httpClient: HttpClient) {
    this.httpClient = httpClient
  }
}
