/**
 * Generic Response Formatting Service for MCP Server
 * Orchestrates the transformation of raw data into AI-optimized MCP response formats
 * with generic context and suggestions
 */

import type {
  McpResponse,
  McpSuccessResponse,
} from '../types/mcp.js';
import { createMcpSuccessResponse } from '../utils/formatters.js';
import { APP_CONFIG } from '../config/appConfig.js';

// ===== RESPONSE FORMATTER SERVICE =====

export class GenericResponseFormatterService {
  /**
   * Formats generic data into an AI-optimized MCP success response.
   * This method provides a basic structure that can be enhanced by individual tools.
   *
   * @param processedData The data already processed by the tool's logic.
   * @param queryStartTime Optional. The timestamp when the query started for latency calculation.
   * @returns A structured McpSuccessResponse.
   */
  formatGenericToolResponse(
    processedData: any,
    queryStartTime?: number,
  ): McpSuccessResponse<any> {
    const startTime = Date.now();
    const queryTime = queryStartTime ? Date.now() - queryStartTime : Date.now() - startTime;

    // Cost Plus Drugs specific metadata, notes, warnings, and next actions
    const costPlusMetadata = {
      total_results: Array.isArray(processedData) ? processedData.length : 1,
      query_time: `${queryTime}ms`,
      data_source: APP_CONFIG.DEFAULT_DATA_SOURCE,
      last_updated: new Date().toISOString(),
      api_version: APP_CONFIG.API_VERSION,
      disclaimer: 'Medication information provided for informational purposes only. Always consult healthcare professionals for medical advice.',
      // Add other Cost Plus Drugs specific metadata fields as needed
    };

    const costPlusClinicalNotes = [
      'Cost Plus Drugs provides affordable medications with transparent pricing.',
      'All medications are FDA-approved and sourced from licensed manufacturers.',
      'Prices shown are current as of the query time and may change.',
    ];

    const costPlusWarnings: string[] = []; // Tools can add specific warnings
    const costPlusNextActions: Array<{ tool: string; reason: string; parameters_hint: string }> = [
      {
        tool: 'search_medicines',
        reason: 'Search for other medications by name or active ingredient',
        parameters_hint: 'query: [medication name]',
      },
      {
        tool: 'get_collections',
        reason: 'Browse medication categories to find related treatments',
        parameters_hint: 'No parameters needed',
      },
    ];

    return createMcpSuccessResponse(processedData, {
      totalResults: costPlusMetadata.total_results,
      queryTime: queryTime,
      additionalInfo: {
        ...costPlusMetadata,
        notes: costPlusClinicalNotes,
        warnings: costPlusWarnings,
        next_actions: costPlusNextActions,
      },
    });
  }
}

// ===== SINGLETON INSTANCE =====

let formatterInstance: GenericResponseFormatterService | null = null;

/**
 * Gets singleton instance of the generic response formatter
 */
export function getResponseFormatter(): GenericResponseFormatterService {
  if (!formatterInstance) {
    formatterInstance = new GenericResponseFormatterService();
  }
  return formatterInstance;
}
