# Cost Plus Drugs MCP Server

A Model Context Protocol (MCP) server that provides AI agents with affordable access to Cost Plus Drugs pharmacy services, offering transparent medication pricing and comprehensive drug information.

## 🌟 Features

The Cost Plus Drugs MCP server empowers AI agents with:

- **🔍 Smart Medication Search**: Find medications by name, active ingredient, or related terms
- **📂 Category Navigation**: Browse 95+ medication categories including specialized health areas
- **💊 Comprehensive Drug Database**: Access detailed medication information with transparent pricing
- **📄 Advanced Pagination**: Navigate through large result sets efficiently with smart filtering
- **🏥 Healthcare Integration**: Support for women's health, chronic conditions, and specialized treatments

## 🚀 Quick Start

### For AI Agents & Developers:

1. **Install & Setup:**
   ```bash
   git clone https://github.com/your-username/cost-plus-drugs-mcp-server.git
   cd cost-plus-drugs-mcp-server
   npm install && npm run build
   ```

2. **Start the Server:**
   ```bash
   # Stdio mode (recommended for AI agents)
   npm start

   # HTTP mode (port 3000)
   npm run start:http
   ```

## 🛠️ Available Tools

### `search_medicines`
**Find medications by exact name (generic or brand)**
```json
{
  "tool": "search_medicines",
  "arguments": {
    "query": "metformin"
  }
}
```

### `get_collections`
**Browse all medication categories or search for specific ones**
```json
{
  "tool": "get_collections",
  "arguments": {}
}
```

### `get_all_products`
**Retrieve medications with filtering by category and pagination (always sorted alphabetically by name)**
```json
{
  "tool": "get_all_products",
  "arguments": {
    "first": 10,
    "collection": 31
  }
}
```

## 📚 Available Resources

### `cost_plus_drugs_collections`
**Complete medication category database**
- **URI**: `cost-plus-drugs://collections`
- **Categories**: 95 specialized health categories
- **Filtering**: Search by name or slug with `?query=diabetes`

## ⚙️ Configuration

Customize with environment variables:
- `API_BASE_URL`: GraphQL API endpoint (default: https://www.costplusdrugs.com)
- `API_TIMEOUT_MS`: Request timeout in milliseconds (default: 30000)
- `API_RETRY_ATTEMPTS`: Retry attempts for failed requests (default: 3)
- `MCP_SERVER_NAME`: Server identifier (default: cost-plus-drugs-mcp-server)

## 💡 Sample Use Cases

**Healthcare AI Assistant:**
- Compare medication prices across categories
- Find affordable alternatives for expensive treatments
- Provide transparent pricing information to patients
- Navigate complex medication categories efficiently

**Research Applications:**
- Analyze medication pricing trends
- Study category-specific treatment options
- Generate comprehensive drug information reports

## 📖 Development Guidelines

For comprehensive development instructions and AI agent integration guidelines, see [`AGENTS.md`](AGENTS.md).

## 📋 API Response Format

All tools return structured responses with:
- **Complete medication data** (pricing, forms, availability)
- **Clinical context** and safety information
- **Pagination support** for large datasets
- **Error handling** with recovery suggestions

## 🔒 License

Licensed under **Creative Commons Attribution-NonCommercial-ShareAlike 4.0 International (CC BY-NC-SA 4.0)**

For commercial licensing inquiries, please contact the author.

---

**Medical Disclaimer**: This software provides informational purposes only and is not intended for medical diagnosis or treatment decisions. Always consult qualified healthcare professionals for medical advice and verify information with official sources.
