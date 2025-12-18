import fs from 'fs';
import path from 'path';

const MCP_PID_FILE = path.join(process.cwd(), '.mcp-server-pid');

export default async function globalTeardown() {
  if (fs.existsSync(MCP_PID_FILE)) {
    const pid = parseInt(fs.readFileSync(MCP_PID_FILE, 'utf-8'), 10);
    try {
      process.kill(pid);
      console.log(`MCP server with PID ${pid} stopped.`);
    } catch (error) {
      console.error(`Failed to stop MCP server with PID ${pid}:`, error);
    }

    fs.unlinkSync(MCP_PID_FILE);
  }
}