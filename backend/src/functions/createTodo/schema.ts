export default {
  title: "create todo",
  type: "object",
  properties: {
    name: {
      type: "string",
    },
    dueDate: {
      type: "string",
    },
  },
  required: ["name", "dueDate"],
  additionalProperties: false,
} as const;
