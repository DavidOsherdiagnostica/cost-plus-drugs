import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { MCP_SERVER_CONFIG } from "./config/appConfig.js";

// Import Cost Plus Drugs tool and resource registrations
import { registerSearchMedicinesTool } from "./tools/searchMedicinesTool.js";
import { registerGetCollectionsTool } from "./tools/getCollectionsTool.js";
import { registerGetAllProductsTool } from "./tools/getAllProductsTool.js";
import { registerCostPlusDrugsCollectionsResource } from "./resources/costPlusDrugsCollectionsResource.js";

// Create Cost Plus Drugs MCP Server
const server = new McpServer({
  name: MCP_SERVER_CONFIG.SERVER_NAME,
  version: MCP_SERVER_CONFIG.SERVER_VERSION
});

// Register Cost Plus Drugs tools and resources
registerSearchMedicinesTool(server);
registerGetCollectionsTool(server);
registerGetAllProductsTool(server);
registerCostPlusDrugsCollectionsResource(server);

// All template files removed - using only Cost Plus Drugs specific tools and resources
// TODO: Add additional Cost Plus Drugs tools and resources here as needed
// import { registerYourCustomCostPlusDrugsTool } from "./tools/yourCustomCostPlusDrugsTool.js";
// registerYourCustomCostPlusDrugsTool(server);

// Start MCP in stdio mode
const transport = new StdioServerTransport();
server.connect(transport).then(() => {
  // console.log("MCP Server connected in stdio mode."); // Remove for clean JSON output
});
