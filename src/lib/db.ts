import fs from 'fs';
import path from 'path';
import { User } from './types';
// Add this import at the top of the file
import { UserTestResult } from './types';


// Resolve the path to the users.json file
const usersFilePath = path.resolve(process.cwd(), 'src/data/users.json');

// Function to read users from the JSON file
export const readUsers = (): User[] => {
  // If the file doesn't exist, return an empty array
  if (!fs.existsSync(usersFilePath)) {
    return [];
  }
  
  // Read the file content
  const fileContent = fs.readFileSync(usersFilePath, 'utf-8');
  
  // Parse the JSON content and return it as an array of User objects
  return JSON.parse(fileContent) as User[];
};

// Function to write users to the JSON file
export const writeUsers = (users: User[]) => {
  // Write the users array to the file, formatted with 2-space indentation
  fs.writeFileSync(usersFilePath, JSON.stringify(users, null, 2));
};


// Add this new file path variable below your usersFilePath
const historyFilePath = path.resolve(process.cwd(), 'src/data/user-test-history.json');

// Add these new functions to the end of the file
export const readHistory = (): UserTestResult[] => {
  if (!fs.existsSync(historyFilePath)) {
    return [];
  }
  const fileContent = fs.readFileSync(historyFilePath, 'utf-8');
  return JSON.parse(fileContent) as UserTestResult[];
};

export const writeHistory = (history: UserTestResult[]) => {
  fs.writeFileSync(historyFilePath, JSON.stringify(history, null, 2));
};