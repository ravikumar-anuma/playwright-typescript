import { spawn } from 'child_process';
import fs from 'fs';
import path from 'path';

const MCP_PID_FILE = path.join(process.cwd(), '.mcp-server-pid');

export default async function globalSetup() {
  const mcpCommand = process.env.MCP_CMD || 'node ./mcp/server.js';
  const [command, ...args] = mcpCommand.split(' ');

  const mcpProcess = spawn(command, args, {
    detached: true,
    stdio: 'ignore',
  });

  fs.writeFileSync(MCP_PID_FILE, String(mcpProcess.pid));
  mcpProcess.unref();

  console.log('Waiting for MCP server to start...');
  await new Promise((resolve) => setTimeout(resolve, 5000)); // Adjust delay as needed
}