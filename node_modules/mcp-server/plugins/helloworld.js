export function tool () {
  return {
    name: "helloworld",
    description: "Returns a hello world message",
    inputs: [
      {
        name: "name",
        type: "string",
        description: "Name to greet",
        required: false,
        default: "World"
      }
    ],
    fn: async (params) => {
      const name = typeof params === 'object' ? params.name || "World" : params;
      return {
        message: `Hello, ${name}!`
      };
    }
  };
} 