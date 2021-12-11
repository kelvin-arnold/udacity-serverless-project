export default {
  title: "create todo",
  type: "object",
  properties: {
    name: {
      type: "string",
      minLength: 1,
    },
    dueDate: {
      type: "string",
    },
  },
  required: ["name", "dueDate"],
  additionalProperties: false,
} as const;
