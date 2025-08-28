import fs from 'fs';
import path from 'path';
import { User, UserTestResult } from './types';

const usersFilePath = path.resolve(process.cwd(), 'src/data/users.json');
const historyFilePath = path.resolve(process.cwd(), 'src/data/user-test-history.json');

export const readUsers = (): User[] => {
  if (!fs.existsSync(usersFilePath)) return [];
  const fileContent = fs.readFileSync(usersFilePath, 'utf-8');
  return JSON.parse(fileContent) as User[];
};

export const writeUsers = (users: User[]) => {
  fs.writeFileSync(usersFilePath, JSON.stringify(users, null, 2));
};

export const readHistory = (): UserTestResult[] => {
  if (!fs.existsSync(historyFilePath)) return [];
  const fileContent = fs.readFileSync(historyFilePath, 'utf-8');
  return JSON.parse(fileContent) as UserTestResult[];
};

export const writeHistory = (history: UserTestResult[]) => {
  fs.writeFileSync(historyFilePath, JSON.stringify(history, null, 2));
};