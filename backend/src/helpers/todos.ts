import { Todos } from "./todosAcess";
import { AttachmentUtils } from "./attachmentUtils";
import { TodoItem } from "../models/TodoItem";
import { TodoUpdate } from "../models/TodoUpdate";
// import { createLogger } from '../utils/logger'
import { v4 as uuidv4 } from "uuid";

// TODO: Implement businessLogic

// const logger = createLogger('TodosAccess')
const newTodos = new Todos();
const newAttachUtil = new AttachmentUtils();

const getTodosForUser = async (userId: string) => {
  return await newTodos.getTodos(userId);
};
const createTodo = async (
  newTodo: TodoItem,
  userId: string,
  attachmentUrl: string
) => {
  const newItem: TodoItem = {
    todoId: uuidv4(),
    userId,
    name: newTodo.name,
    dueDate: newTodo.dueDate,
    createdAt: new Date().toISOString(),
    done: false,
    attachmentUrl,
  };
  return await newTodos.createTodos(newItem);
};
const deleteTodo = async (todoId: string, userId: string) => {
  return await newTodos.deleteTodo(todoId, userId);
};
const updateTodo = async (
  newTodo: TodoUpdate,
  todoId: string,
  userId: string
) => {
  return await newTodos.updateTodo(newTodo, todoId, userId);
};
const generateUploadUrl = async (imageId: string) => {
  const attach = await newAttachUtil.getUploadUrl(imageId);
  return {
    attach,
  };
};

const todoExists = async (todoId: string, userId: string) => {
  return await newTodos.todoExists(todoId, userId);
};

export {
  getTodosForUser,
  createTodo,
  deleteTodo,
  updateTodo,
  generateUploadUrl,
  todoExists,
};
