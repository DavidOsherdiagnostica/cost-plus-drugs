/**
 * Search Medicines Tool for Cost Plus Drugs API
 * Allows searching for medications by name or search term
 */

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { McpResponse } from "../types/mcp.js";
import { getApiClient } from "../services/apiClient.js";
import { getResponseFormatter } from "../services/responseFormatter.js";
import { validateToolInput } from "../utils/validators.js";
import { classifyError, createComprehensiveErrorResponse } from "../utils/errorHandler.js";
import { APP_CONFIG } from "../config/appConfig.js";
import type { SearchMedicinesResponse } from "../types/api.js";

// No local data processing; we call GraphQL and return raw response

// Define the Zod schema for the search medicines tool input
export const SearchMedicinesToolSchema = z.object({
  query: z.string().optional().default("").describe("The medication name or search term to look for (empty for all)"),
});

// Define the TypeScript type for the tool's input
export type SearchMedicinesInput = z.infer<typeof SearchMedicinesToolSchema>;

// ===== TOOL REGISTRATION =====

export function registerSearchMedicinesTool(server: McpServer): void {
  server.registerTool(
    "search_medicines", // Unique API name for the tool
    {
      title: "Search Medicines",
      description: `Search for medications by name ONLY - finds medications that match a specific medication name.\n\n**Purpose:** Find specific medications when you know the medication name (generic or brand name).\n\n**Important:** This tool searches by MEDICATION NAME only. To browse medications by category/condition (like "diabetes" or "heart health"), use the "get_all_products" tool with a collection ID.\n\n**Input Parameters:**\n- query: (string, required) The exact or partial medication name to search for (e.g., "metformin", "aspirin", "lisinopril")\n\n**Output:** Returns only medications whose name, brand name, or collection matches the search query.\n\n**Examples:**\n- Search for "metformin" → finds Metformin, Metformin ER, Glipizide-Metformin HCl, etc.\n- Search for "aspirin" → finds aspirin-containing medications\n- Search for "atorvastatin" → finds Atorvastatin (Lipitor generic)\n\n**Wrong Usage:**\n- ❌ Don't use: query: "diabetes medications" (use get_all_products with diabetes collection instead)\n- ❌ Don't use: query: "blood pressure" (use get_collections to find the category, then get_all_products)\n- ✅ Correct: query: "lisinopril" (specific medication name)`,
      inputSchema: SearchMedicinesToolSchema.shape,
    },
    async (input: SearchMedicinesInput): Promise<McpResponse<SearchMedicinesResponse>> => {
      const startTime = Date.now();
      const apiClient = getApiClient();
      const responseFormatter = getResponseFormatter();

      try {
        // 1. Validate input using the validator
        const { data: validatedInput } = validateToolInput(SearchMedicinesToolSchema, input, "search_medicines");

        // 2. Call GraphQL SearchMedicines
        const apiResponse = await apiClient.searchMedicines({ medicationSearch: validatedInput.query || "" });

        // 3. Filter results by query if provided
        if (validatedInput.query && validatedInput.query.trim()) {
          const lowerQuery = validatedInput.query.toLowerCase().trim();
          
          // Filter products that match the search term
          const filteredEdges = apiResponse.data.products.edges.filter(edge => {
            const product = edge.node;
            const nameMatch = product.name.toLowerCase().includes(lowerQuery);
            const brandMatch = product.metafields?.brandName?.toLowerCase().includes(lowerQuery);
            const collectionsMatch = product.collections?.some(col => 
              col.name.toLowerCase().includes(lowerQuery)
            );
            
            return nameMatch || brandMatch || collectionsMatch;
          });

          // Return filtered response
          const filteredResponse = {
            data: {
              products: {
                ...apiResponse.data.products,
                edges: filteredEdges
              }
            }
          };

          return responseFormatter.formatGenericToolResponse(filteredResponse, startTime);
        }

        // 4. Return raw GraphQL response if no query
        return responseFormatter.formatGenericToolResponse(apiResponse, startTime);

      } catch (error) {
        // Centralized error handling
        const classifiedError = classifyError(error, `Error in search_medicines tool handler`);
        return createComprehensiveErrorResponse(classifiedError, null, {
          toolName: "search_medicines",
          userInput: input
        });
      }
    }
  );
}

// No local filtering; server returns GraphQL response filtered by medicationSearch

// ===== RESPONSE ENHANCEMENT =====

// No local enhancement; returning raw GraphQL response
