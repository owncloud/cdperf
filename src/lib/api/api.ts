import { RefinedResponse, ResponseType } from 'k6/http';

export interface Result {
  response: RefinedResponse<ResponseType>;
}
