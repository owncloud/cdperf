import { HttpClient } from '@/utils'
import { Platform } from '@/values'


export abstract class EndpointClient {
  protected readonly platform: Platform

  protected readonly httpClient: HttpClient

  constructor(platform: Platform, httpClient: HttpClient) {
    this.platform = platform
    this.httpClient = httpClient
  }
}
