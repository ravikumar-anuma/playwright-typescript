import { spawn } from 'child_process';
import fs from 'fs';
import path from 'path';

const MCP_PID_FILE = path.join(process.cwd(), '.mcp-server-pid');

export default async function globalSetup() {
  const mcpCommand = process.env.MCP_CMD || 'npx mcp-server';
  const [command, ...args] = mcpCommand.split(' ');

  console.log('Starting MCP server...');
  const mcpProcess = spawn(command, args, {
    detached: true,
    stdio: 'ignore',
  });

  fs.writeFileSync(MCP_PID_FILE, String(mcpProcess.pid));
  mcpProcess.unref();

  console.log('Waiting for MCP server to become healthy...');
  const maxRetries = 30;
  const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

  for (let i = 0; i < maxRetries; i++) {
    try {
      // Replace with actual health check URL if available
      const response = await fetch('http://localhost:4000/health');
      if (response.ok) {
        console.log('MCP server is healthy.');
        return;
      }
    } catch (error) {
      // Ignore errors and retry
    }
    await delay(1000); // Wait 1 second before retrying
  }

  throw new Error('MCP server did not become healthy after 30 seconds.');
}