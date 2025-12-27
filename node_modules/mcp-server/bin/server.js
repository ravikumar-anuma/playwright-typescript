#!/usr/bin/env node

import express from 'express';
import cors from 'cors';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath, URL } from 'url';

// Helper to determine __dirname in ES modules.
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// Enable CORS and JSON parsing middleware.
app.use(cors());
app.use(express.json());

// Helper functions for JSON-RPC responses.
function createResponse (id, result) {
  return {
    jsonrpc: "2.0",
    id: id,
    result: result
  };
}

function createErrorResponse (id, code, message) {
  return {
    jsonrpc: "2.0",
    id: id,
    error: {
      code: code,
      message: message
    }
  };
}

// Load all plugins from both the plugins and private-plugins folders.
const plugins = new Map();
const pluginDirs = [
  new URL('../plugins/', import.meta.url),
  new URL('../private-plugins/', import.meta.url)
];

try {
  for (const pluginsDir of pluginDirs) {
    try {
      const files = await fs.readdir(pluginsDir);
      for (const file of files) {
        if (file.endsWith('.js')) {
          const moduleUrl = new URL(file, pluginsDir);
          const plugin = await import(moduleUrl.href);
          if (typeof plugin.tool === 'function') {
            const toolConfig = plugin.tool();
            plugins.set(toolConfig.name, {
              handler: toolConfig.fn,
              capability: {
                description: toolConfig.description,
                params: {
                  type: "object",
                  properties: Object.fromEntries(
                    toolConfig.inputs?.map(input => [
                      input.name,
                      {
                        type: input.type,
                        description: input.description
                      }
                    ]) || []
                  )
                }
              }
            });
            console.log(`Loaded plugin: ${toolConfig.name}`);
          } else {
            console.warn(`Skipping plugin file ${file} (missing 'tool' function)`);
          }
        }
      }
    } catch (err) {
      // If directory doesn't exist, just continue
      if (err.code === 'ENOENT') {
        console.log(`Optional plugin directory not found: ${pluginsDir}`);
        continue;
      }
      throw err;
    }
  }
} catch (err) {
  console.error("Error loading plugins:", err);
}

// Handle POST requests to the root endpoint.
app.post('/', async (req, res) => {
  try {
    const message = req.body;
    console.log("Received message:", message);

    // Validate JSON-RPC request.
    if (!message.jsonrpc || message.jsonrpc !== "2.0") {
      return res.json(createErrorResponse(message.id, -32600, "Invalid JSON-RPC request"));
    }
    if (!message.method) {
      return res.json(createErrorResponse(message.id, -32600, "Method is required"));
    }

    // Special handling for the "initialize" method:
    // List available capabilities from the loaded plugins.
    if (message.method === "initialize") {
      const capabilities = {};
      plugins.forEach((plugin, method) => {
        if (plugin.capability) {
          capabilities[method] = plugin.capability;
        }
      });
      const response = {
        capabilities,
        serverInfo: {
          name: "Pluggable MCP Server",
          version: "1.0.0"
        }
      };
      return res.json(createResponse(message.id, response));
    }

    // Lookup the plugin for the requested method.
    const plugin = plugins.get(message.method);
    if (!plugin) {
      return res.json(createErrorResponse(message.id, -32601, "Method not found"));
    }

    // Execute the plugin's handler.
    // The handler may be synchronous or return a Promise.
    const result = await plugin.handler(message.params);
    res.json(createResponse(message.id, result));
  } catch (err) {
    console.error("Error processing request:", err);
    res.status(500).json(createErrorResponse(null, -32603, "Internal server error"));
  }
});

// Listen on port 4333.
const PORT = process.env.PORT || 4333;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server listening on port ${PORT}`);
});
