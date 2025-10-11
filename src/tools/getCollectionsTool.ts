/**
 * Get Collections Tool for Cost Plus Drugs API
 * Allows retrieving medication categories/collections
 */

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { McpResponse } from "../types/mcp.js";
import { getApiClient } from "../services/apiClient.js";
import { getResponseFormatter } from "../services/responseFormatter.js";
import { validateToolInput } from "../utils/validators.js";
import { classifyError, createComprehensiveErrorResponse } from "../utils/errorHandler.js";
import type { GetCollectionPathsResponse } from "../types/api.js";

// Define the Zod schema for the get collections tool input
export const GetCollectionsToolSchema = z.object({
  search: z.string().optional().describe("Optional search term to filter collections by name (empty for all)"),
});

// Define the TypeScript type for the tool's input
export type GetCollectionsInput = z.infer<typeof GetCollectionsToolSchema>;

// ===== TOOL REGISTRATION =====

export function registerGetCollectionsTool(server: McpServer): void {
  server.registerTool(
    "get_collections", // Unique API name for the tool
    {
      title: "Get Medication Collections",
      description: `Browse and discover available medication categories/collections on Cost Plus Drugs.\n\n**Purpose:** Find out what medication categories exist (like "Diabetes", "Heart Health", "Mental Health", etc.) and get their IDs for use with get_all_products.\n\n**When to use this tool:**\n- To see ALL available medication categories (don't provide search parameter)\n- To find a specific category by name (e.g., search for "diabetes" or "heart")\n- To get the collection ID needed for filtering with get_all_products\n\n**Input Parameters:**\n- search: (string, optional) Filter collections by name. **Leave empty to get ALL collections without filtering.**\n\n**Output:** Returns medication collections with their ID, name, and slug. Use the ID with get_all_products to get medications in that category.\n\n**Examples:**\n- Get ALL collections: {} (no parameters - returns all ~90 categories)\n- Find diabetes category: { search: "diabetes" } → returns collection with ID you can use\n- Find heart-related categories: { search: "heart" } → returns "Heart Health", "Heart Failure", etc.\n\n**Workflow Example:**\n1. Use get_collections with search: "diabetes" → get ID: "Q29sbGVjdGlvbjozMQ==" (or numeric: 31)\n2. Use get_all_products with collection: 31 → get all diabetes medications`,
      inputSchema: GetCollectionsToolSchema.shape,
    },
    async (input: GetCollectionsInput): Promise<McpResponse<GetCollectionPathsResponse>> => {
      const startTime = Date.now();
      const apiClient = getApiClient();
      const responseFormatter = getResponseFormatter();

      try {
        // 1. Validate input using the validator
        const { data: validatedInput } = validateToolInput(GetCollectionsToolSchema, input, "get_collections");

        // 2. Call GraphQL GetCollectionPaths
        const apiResponse = await apiClient.getCollectionPaths({ search: validatedInput.search ?? "" });

        // 3. Return raw GraphQL response
        return responseFormatter.formatGenericToolResponse(apiResponse, startTime);

      } catch (error) {
        // Centralized error handling
        const classifiedError = classifyError(error, `Error in get_collections tool handler`);
        return createComprehensiveErrorResponse(classifiedError, null, {
          toolName: "get_collections",
          userInput: input
        });
      }
    }
  );
}

// No local filtering; we return GraphQL response from server

// ===== RESPONSE ENHANCEMENT =====

function enhanceCollectionsResponse(
  baseResponse: McpResponse<GetCollectionPathsResponse>,
  _userInput: GetCollectionsInput,
  _validationWarnings: string[],
): McpResponse<GetCollectionPathsResponse> {
  // Intentionally return raw GraphQL response without enhancement
  return baseResponse;
}
