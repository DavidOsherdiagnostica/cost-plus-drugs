/**
 * Get All Products Tool for Cost Plus Drugs API
 * Allows retrieving all medications with pagination and filtering
 */

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { McpResponse } from "../types/mcp.js";
import { getApiClient } from "../services/apiClient.js";
import { getResponseFormatter } from "../services/responseFormatter.js";
import { validateToolInput } from "../utils/validators.js";
import { classifyError, createComprehensiveErrorResponse } from "../utils/errorHandler.js";
import type { GetAllProductsVariables, GetAllProductsResponse } from "../types/api.js";

// Define the Zod schema for the get all products tool input
export const GetAllProductsToolSchema = z.object({
  before: z.string().optional().describe("Cursor for previous page of results"),
  after: z.string().optional().describe("Cursor for next page of results"),
  first: z.number().int().min(1).max(1000).optional().default(25).describe("Number of products to return from the start (default 25, max 1000)"),
  last: z.number().int().min(1).max(1000).optional().describe("Number of products to return from the end (max 1000)"),
  collection: z.union([
    z.string(),
    z.number(),
    z.array(z.string())
  ]).nullable().optional().describe("Collection ID (string like 'Q29sbGVjdGlvbjozMQ=='), numeric ID (like 31), or array of IDs to filter by category"),
});

// Define the TypeScript type for the tool's input
export type GetAllProductsInput = z.infer<typeof GetAllProductsToolSchema>;

// ===== TOOL REGISTRATION =====

export function registerGetAllProductsTool(server: McpServer): void {
  server.registerTool(
    "get_all_products", // Unique API name for the tool
    {
      title: "Get All Products",
      description: `Retrieve medications from Cost Plus Drugs with filtering and pagination.\n\n**Purpose:** Get list of available medications, always sorted alphabetically by name (A-Z).\n\n**Input Parameters:**\n- first: (number, optional) Number of products to return (default: 25, max: 1000)\n- collection: (string, number, or array, optional) Collection ID(s) to filter by category. Accepts:\n  • Base64 ID: "Q29sbGVjdGlvbjozMQ==" (Diabetes)\n  • Numeric ID: 31 (Diabetes)\n  • Array: ["Q29sbGVjdGlvbjozMQ==", "Q29sbGVjdGlvbjozNA=="]\n- after: (string, optional) Cursor for pagination (next page)\n- before: (string, optional) Cursor for pagination (previous page)\n\n**Output:** Returns medications sorted alphabetically (A-Z) with pagination info.\n\n**Examples:**\n- Get first 25 products: {} (no parameters)\n- Get 10 diabetes medications: { first: 10, collection: 31 } or { first: 10, collection: "Q29sbGVjdGlvbjozMQ==" }\n- Multiple categories: { first: 50, collection: ["Q29sbGVjdGlvbjozMQ==", "Q29sbGVjdGlvbjozNA=="] }\n- Get next page: { after: "cursor_from_previous_response" }`,
      inputSchema: GetAllProductsToolSchema.shape,
    },
    async (input: GetAllProductsInput): Promise<McpResponse<GetAllProductsResponse>> => {
      const startTime = Date.now();
      const apiClient = getApiClient();
      const responseFormatter = getResponseFormatter();

      try {
        // 1. Validate input using the validator
        const { data: validatedInput } = validateToolInput(GetAllProductsToolSchema, input, "get_all_products");

        // 2. Normalize collection input (handle string, number, or array)
        let collectionArray: string[] | null = null;
        if (validatedInput.collection) {
          if (typeof validatedInput.collection === 'string') {
            // Try to parse if it's a JSON string, otherwise treat as single ID
            try {
              const parsed = JSON.parse(validatedInput.collection);
              collectionArray = Array.isArray(parsed) ? parsed : [validatedInput.collection];
            } catch {
              collectionArray = [validatedInput.collection];
            }
          } else if (Array.isArray(validatedInput.collection)) {
            collectionArray = validatedInput.collection;
          } else if (typeof validatedInput.collection === 'number') {
            // Convert number to Base64 encoded Collection ID
            collectionArray = [Buffer.from(`Collection:${validatedInput.collection}`).toString('base64')];
          }
        }

        // 3. Call the Cost Plus Drugs GraphQL API with fixed sorting
        const variables: GetAllProductsVariables = {
          before: validatedInput.before,
          after: validatedInput.after,
          first: validatedInput.first,
          last: validatedInput.last,
          direction: "ASC", // Fixed: always ascending
          productOrderField: "NAME", // Fixed: always sort by name
          collection: collectionArray,
        } as GetAllProductsVariables;

        const apiResponse = await apiClient.getAllProducts(variables);

        // 4. Return the raw GraphQL response
        return responseFormatter.formatGenericToolResponse(apiResponse, startTime);

      } catch (error) {
        // Centralized error handling
        const classifiedError = classifyError(error, `Error in get_all_products tool handler`);
        return createComprehensiveErrorResponse(classifiedError, null, {
          toolName: "get_all_products",
          userInput: input
        });
      }
    }
  );
}

// No local processing or enhancement; raw GraphQL response is returned
