export function tool () {
  return {
    name: "echo",
    description: "Echoes back the received parameters",
    inputs: [
      {
        name: "message",
        type: "string",
        description: "Message to echo back",
        required: true
      }
    ],
    fn: async (params) => {
      // Handle both object format and direct value
      const message = typeof params === 'object' ? params.message : params;
      return message;
    }
  };
} 