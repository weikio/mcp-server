#!/usr/bin/env node

import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  McpError,
  ErrorCode,
} from "@modelcontextprotocol/sdk/types.js";
import { exec } from "child_process";
import { promisify } from "util";
import { metadataService, Component, Kamelet } from "./metadata-service.js";
import { integrationTypesService } from "./integration-types-service.js";
import { dockerComposeConfig } from "./docker-compose-config.js";

const execAsync = promisify(exec);

/**
 * Create an MCP server with tools for interacting with the Weik.io CLI
 * and Apache Camel metadata
 */
const server = new Server(
  {
    name: "weikio-server",
    version: "0.1.0",
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

/**
 * Execute a Weik.io CLI command and return its output
 */
async function executeWeikioCommand(command: string): Promise<string> {
  try {
    const { stdout, stderr } = await execAsync(`weikio ${command}`);
    if (stderr) {
      throw new Error(stderr);
    }
    return stdout;
  } catch (error) {
    throw new McpError(
      ErrorCode.InternalError,
      `Weik.io CLI error: ${error instanceof Error ? error.message : String(error)}`
    );
  }
}

/**
 * Handler that lists available tools.
 * Exposes tools for:
 * 1. Weik.io CLI operations
 * 2. Apache Camel metadata operations
 */
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      // Weik.io CLI tools
      {
        name: "list_agents",
        description: "List all Weik.io agents",
        inputSchema: {
          type: "object",
          properties: {},
          required: []
        }
      },
      {
        name: "apply_config",
        description: "Apply a Weik.io configuration file",
        inputSchema: {
          type: "object",
          properties: {
            filepath: {
              type: "string",
              description: "Path to the YAML configuration file"
            }
          },
          required: ["filepath"]
        }
      },
      
      // Integration advisor tools
      {
        name: "get_supported_integration_types",
        description: "Get information about supported integration types in Weik.io",
        inputSchema: {
          type: "object",
          properties: {},
          required: []
        }
      },
      
      // Apache Camel metadata tools
      {
        name: "search_components",
        description: "Search for Apache Camel components by name, description, or label",
        inputSchema: {
          type: "object",
          properties: {
            query: {
              type: "string",
              description: "Search query"
            }
          },
          required: ["query"]
        }
      },
      {
        name: "get_component_details",
        description: "Get detailed information about a specific Apache Camel component",
        inputSchema: {
          type: "object",
          properties: {
            name: {
              type: "string",
              description: "Component name"
            }
          },
          required: ["name"]
        }
      },
      {
        name: "search_kamelets",
        description: "Search for Apache Camel Kamelets by name, title, or description",
        inputSchema: {
          type: "object",
          properties: {
            query: {
              type: "string",
              description: "Search query"
            }
          },
          required: ["query"]
        }
      },
      {
        name: "get_kamelet_details",
        description: "Get detailed information about a specific Apache Camel Kamelet",
        inputSchema: {
          type: "object",
          properties: {
            name: {
              type: "string",
              description: "Kamelet name"
            }
          },
          required: ["name"]
        }
      },
      {
        name: "get_docker_compose",
        description: "Get a Docker Compose file for setting up a local Weik.io instance",
        inputSchema: {
          type: "object",
          properties: {},
          required: []
        }
      }
    ]
  };
});

/**
 * Handler for executing the tools
 */
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  switch (request.params.name) {
    // Weik.io CLI tools
    case "list_agents": {
      const output = await executeWeikioCommand("agents ls");
      return {
        content: [{
          type: "text",
          text: output
        }]
      };
    }

    case "apply_config": {
      const filepath = String(request.params.arguments?.filepath);
      if (!filepath) {
        throw new McpError(
          ErrorCode.InvalidParams,
          "Configuration file path is required"
        );
      }

      const output = await executeWeikioCommand(`config apply ${filepath}`);
      return {
        content: [{
          type: "text",
          text: output
        }]
      };
    }
    
    // Integration advisor tools
    case "get_supported_integration_types": {
      return {
        content: [{
          type: "text",
          text: JSON.stringify(integrationTypesService.getIntegrationTypes(), null, 2)
        }]
      };
    }

    // Apache Camel metadata tools
    case "search_components": {
      const query = String(request.params.arguments?.query);
      if (!query) {
        throw new McpError(
          ErrorCode.InvalidParams,
          "Search query is required"
        );
      }

      try {
        await metadataService.initialize();
        console.error(`Components loaded: ${metadataService.getComponentsCount()}`);
        
        const components = metadataService.searchComponents(query);
        console.error(`Search results for "${query}": ${components.length} components found`);
        
        if (components.length === 0) {
          return {
            content: [{
              type: "text",
              text: `No components found matching "${query}"`
            }]
          };
        }

        const result = components.map((c: Component) => 
          `- **${c.name}**: ${c.description ? c.description.split('.')[0] + '.' : 'No description available.'}`
        ).join('\n');

        return {
          content: [{
            type: "text",
            text: `Found ${components.length} components matching "${query}":\n\n${result}`
          }]
        };
      } catch (error) {
        console.error('Error searching components:', error);
        throw new McpError(
          ErrorCode.InternalError,
          `Error searching components: ${error instanceof Error ? error.message : String(error)}`
        );
      }
    }

    case "get_component_details": {
      const name = String(request.params.arguments?.name);
      if (!name) {
        throw new McpError(
          ErrorCode.InvalidParams,
          "Component name is required"
        );
      }

      await metadataService.initialize();
      const component = metadataService.getComponent(name);
      
      if (!component) {
        return {
          content: [{
            type: "text",
            text: `Component "${name}" not found`
          }]
        };
      }

      return {
        content: [{
          type: "text",
          text: metadataService.formatComponentDetails(component)
        }]
      };
    }

    case "search_kamelets": {
      const query = String(request.params.arguments?.query);
      if (!query) {
        throw new McpError(
          ErrorCode.InvalidParams,
          "Search query is required"
        );
      }

      try {
        await metadataService.initialize();
        console.error(`Kamelets loaded: ${metadataService.getKameletsCount()}`);
        
        const kamelets = metadataService.searchKamelets(query);
        console.error(`Search results for "${query}": ${kamelets.length} kamelets found`);
        
        if (kamelets.length === 0) {
          return {
            content: [{
              type: "text",
              text: `No kamelets found matching "${query}"`
            }]
          };
        }

        const result = kamelets.map((k: Kamelet) => {
          if (!k || !k.metadata || !k.metadata.name || !k.spec || !k.spec.definition || !k.spec.definition.description) {
            return `- **Unknown kamelet**: No description available.`;
          }
          return `- **${k.metadata.name}**: ${k.spec.definition.description.split('.')[0]}.`;
        }).join('\n');

        return {
          content: [{
            type: "text",
            text: `Found ${kamelets.length} kamelets matching "${query}":\n\n${result}`
          }]
        };
      } catch (error) {
        console.error('Error searching kamelets:', error);
        throw new McpError(
          ErrorCode.InternalError,
          `Error searching kamelets: ${error instanceof Error ? error.message : String(error)}`
        );
      }
    }

    case "get_kamelet_details": {
      const name = String(request.params.arguments?.name);
      if (!name) {
        throw new McpError(
          ErrorCode.InvalidParams,
          "Kamelet name is required"
        );
      }

      await metadataService.initialize();
      const kamelet = metadataService.getKamelet(name);
      
      if (!kamelet) {
        return {
          content: [{
            type: "text",
            text: `Kamelet "${name}" not found`
          }]
        };
      }

      return {
        content: [{
          type: "text",
          text: metadataService.formatKameletDetails(kamelet)
        }]
      };
    }

    case "get_docker_compose": {
      return {
        content: [{
          type: "text",
          text: dockerComposeConfig
        }]
      };
    }

    default:
      throw new McpError(
        ErrorCode.MethodNotFound,
        `Unknown tool: ${request.params.name}`
      );
  }
});

/**
 * Start the server using stdio transport
 */
async function main() {
  try {
    // Initialize metadata service before starting the server
    console.error("Initializing metadata service...");
    try {
      await metadataService.initialize();
      console.error(`Metadata service initialized successfully.`);
      console.error(`Loaded ${metadataService.getComponentsCount()} components`);
      console.error(`Loaded ${metadataService.getKameletsCount()} kamelets`);
    } catch (metadataError) {
      console.error("Failed to initialize metadata service:", metadataError);
      console.error("Server will start, but metadata operations may not work correctly");
    }

    const transport = new StdioServerTransport();
    await server.connect(transport);
    console.error("Weik.io MCP server running on stdio");
  } catch (error) {
    console.error("Server startup error:", error);
    process.exit(1);
  }
}

// Error handling for the main server process
process.on("uncaughtException", (error) => {
  console.error("Uncaught exception:", error);
  process.exit(1);
});

process.on("unhandledRejection", (reason) => {
  console.error("Unhandled rejection:", reason);
  process.exit(1);
});

main().catch((error) => {
  console.error("Server error:", error);
  process.exit(1);
});
