import fetch from 'node-fetch';
import { GenericError, ErrorType, ErrorSeverity } from '../types/errors.js';
import { APP_CONFIG, REQUEST_CONFIG } from '../config/appConfig.js';
import { classifyError, logError } from '../utils/errorHandler.js';
import type {
  SearchMedicinesVariables,
  GetCollectionPathsVariables,
  GetAllProductsVariables,
  SearchMedicinesResponse,
  GetCollectionPathsResponse,
  GetAllProductsResponse
} from '../types/api.js';

// ===== API CLIENT CLASS =====

export class GenericApiClient {
  private readonly baseUrl: string;
  private readonly timeout: number;
  private readonly maxRetries: number;
  private readonly retryDelay: number;

  constructor() {
    this.baseUrl = APP_CONFIG.API_BASE_URL;
    this.timeout = REQUEST_CONFIG.TIMEOUT_MS;
    this.maxRetries = REQUEST_CONFIG.RETRY_ATTEMPTS;
    this.retryDelay = REQUEST_CONFIG.RETRY_DELAY_MS;
  }

  // ===== CORE HTTP METHODS =====

  /**
   * Makes a POST request to the API with retry logic
   * This method is generic and can be used for any API call.
   */
  private async makeRequest<T>(
    endpoint: string,
    body: Record<string, unknown>,
    attemptNumber = 1,
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    const correlationId = this.generateCorrelationId();

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), this.timeout);

      const response = await fetch(url, {
        method: 'POST',
        headers: REQUEST_CONFIG.HEADERS,
        body: JSON.stringify(body),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const responseText = await response.text();

      if (!responseText.trim()) {
        throw new GenericError(ErrorType.API_INVALID_RESPONSE, 'API returned empty response', {
          severity: ErrorSeverity.HIGH,
          correlationId,
          details: { endpoint, body },
        });
      }

      try {
        return JSON.parse(responseText) as T;
      } catch (parseError) {
        throw new GenericError(ErrorType.API_INVALID_RESPONSE, 'API returned invalid JSON', {
          severity: ErrorSeverity.HIGH,
          correlationId,
          details: { endpoint, body, responseText: responseText.substring(0, 200) },
        });
      }
    } catch (error) {
      const classifiedError = classifyError(error, `${endpoint} - attempt ${attemptNumber}`);
      const errorWithCorrelationId = classifiedError.copyWith({ correlationId });

      logError(errorWithCorrelationId, `API request to ${endpoint}`);

      if (attemptNumber < this.maxRetries && this.shouldRetry(errorWithCorrelationId)) {
        await this.delay(this.retryDelay * attemptNumber);
        return this.makeRequest<T>(endpoint, body, attemptNumber + 1);
      }

      throw errorWithCorrelationId;
    }
  }

  /**
   * Perform a GraphQL API call to Cost Plus Drugs API.
   *
   * @param query The GraphQL query string.
   * @param variables The variables for the GraphQL query.
   * @returns A promise that resolves to the API response (type T).
   */
  async performGraphQLCall<T>(query: string, variables: Record<string, unknown> = {}): Promise<T> {
    const endpoint = '/graphql/';
    const requestBody = {
      query,
      variables
    };

    return this.makeRequest<T>(endpoint, requestBody);
  }

  /**
   * Search for medications by name or search term.
   */
  async searchMedicines(variables: SearchMedicinesVariables): Promise<SearchMedicinesResponse> {
    const query = `
      query SearchMedicines($medicationSearch: String) {
        products(
          channel: "default-channel"
          first: 1000
          medicationSearch: $medicationSearch
        ) {
          edges {
            node {
              id
              name
              slug
              collections {
                name
                slug
                __typename
              }
              priceCalculation
              retailPrice
              variants {
                id
                sku
                metafields(keys: [
                  "retailPricePerUnit","form","slug","sku","package_size",
                  "is_active","insuranceEligible","cashEligible"
                ])
                images { url __typename }
                specialtyMedication
                __typename
              }
              isAvailable
              metafields(keys: ["brandGeneric","brandName","external_promotion","medication_full_display_name"])
              __typename
            }
            __typename
          }
          __typename
        }
      }
    `;

    return this.performGraphQLCall<SearchMedicinesResponse>(query, variables);
  }

  /**
   * Get all available collections/categories.
   */
  async getCollectionPaths(variables: GetCollectionPathsVariables): Promise<GetCollectionPathsResponse> {
    const query = `
      query GetCollectionPaths($search: String) {
        collections(first: 1000, channel: "default-channel", filter: { search: $search }) {
          edges {
            node {
              id
              name
              slug
              __typename
            }
            __typename
          }
          __typename
        }
      }
    `;

    return this.performGraphQLCall<GetCollectionPathsResponse>(query, variables);
  }

  /**
   * Get products with pagination and filtering.
   */
  async getAllProducts(variables: GetAllProductsVariables): Promise<GetAllProductsResponse> {
    const query = `
      query GetAllProducts(
        $before: String, $after: String, $first: Int, $last: Int,
        $direction: OrderDirection!, $productOrderField: ProductOrderField!, $collection: [ID!]
      ) {
        products(
          first: $first
          last: $last
          channel: "default-channel"
          after: $after
          before: $before
          sortBy: { direction: $direction, field: $productOrderField }
          filter: { collections: $collection }
        ) {
          edges {
            node {
              id
              name
              slug
              collections { name slug __typename }
              priceCalculation
              retailPrice
              variants {
                id sku
                metafields(keys: [
                  "retailPricePerUnit","form","slug","sku","package_size",
                  "is_active","insuranceEligible","cashEligible"
                ])
                images { url __typename }
                specialtyMedication
                __typename
              }
              isAvailable
              metafields(keys: ["brandGeneric","brandName","external_promotion","medication_full_display_name"])
              __typename
            }
            __typename
          }
          totalCount
          pageInfo { startCursor endCursor hasNextPage hasPreviousPage __typename }
          __typename
        }
      }
    `;

    return this.performGraphQLCall<GetAllProductsResponse>(query, variables);
  }

  // ===== UTILITY METHODS =====

  /**
   * Determines if an error should trigger a retry
   */
  private shouldRetry(error: GenericError): boolean {
    const retryableTypes = [
      ErrorType.API_TIMEOUT,
      ErrorType.API_CONNECTION_ERROR,
      ErrorType.API_RATE_LIMIT,
    ];

    return retryableTypes.includes(error.type);
  }

  /**
   * Delays execution for retry logic
   */
  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  /**
   * Generates correlation ID for request tracking
   */
  private generateCorrelationId(): string {
    return `mcp-generic-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  // ===== HEALTH CHECK =====

  /**
   * Performs a health check on the Cost Plus Drugs API.
   */
  async healthCheck(): Promise<{
    status: 'healthy' | 'degraded' | 'unhealthy';
    latency: number;
    endpoints: Record<string, boolean>;
  }> {
    const startTime = Date.now();
    const endpointResults: Record<string, boolean> = {};

    try {
      // Test the GraphQL endpoint with a simple query
      await this.performGraphQLCall('/graphql/', {
        query: 'query { __typename }'
      });
      endpointResults.graphql_endpoint = true;
    } catch {
      endpointResults.graphql_endpoint = false;
    }

    const latency = Date.now() - startTime;
    const healthyEndpoints = Object.values(endpointResults).filter(Boolean).length;
    const totalEndpoints = Object.keys(endpointResults).length;

    let status: 'healthy' | 'degraded' | 'unhealthy';
    if (healthyEndpoints === totalEndpoints && totalEndpoints > 0) {
      status = 'healthy';
    } else if (healthyEndpoints > 0) {
      status = 'degraded';
    } else {
      status = 'unhealthy';
    }

    return {
      status,
      latency,
      endpoints: endpointResults,
    };
  }
}

// ===== SINGLETON INSTANCE =====

let apiClientInstance: GenericApiClient | null = null;

/**
 * Gets singleton instance of the generic API client
 */
export function getApiClient(): GenericApiClient {
  if (!apiClientInstance) {
    apiClientInstance = new GenericApiClient();
  }
  return apiClientInstance;
}
