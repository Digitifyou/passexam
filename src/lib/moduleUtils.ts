// src/lib/moduleUtils.ts
// SERVER-SIDE ONLY FILE

import fs from 'fs';
import path from 'path';

// --- Path to Mapping File ---
const mappingFilePath = path.resolve(process.cwd(), 'src/data/module_mapping.json');
let moduleNameMapping: Record<string, string> | null = null;

// Function to load the mapping from the JSON file
function loadModuleNameMapping(): Record<string, string> {
    if (moduleNameMapping === null) {
        try {
            if (fs.existsSync(mappingFilePath)) {
                const fileContent = fs.readFileSync(mappingFilePath, 'utf-8');
                moduleNameMapping = JSON.parse(fileContent);
                console.log("Successfully loaded module mapping."); // Log success
            } else {
                console.error(`Module mapping file NOT FOUND at ${mappingFilePath}`);
                moduleNameMapping = {}; // Use empty object as fallback
            }
        } catch (error) {
            console.error('Error reading or parsing module mapping file:', error);
            moduleNameMapping = {}; // Use empty object on error
        }
    }
    return moduleNameMapping;
}

// Function to get the verified name
export function getVerifiedModuleName(filename: string): string {
    const mapping = loadModuleNameMapping();
    const key = filename.replace('.json', '');
    if (mapping[key]) {
        return mapping[key]; // Return name from mapping
    } else {
        // Fallback if key not in mapping
        console.warn(`Module name mapping not found for key: "${key}". Using cleaned filename.`);
        return key.replace(/[-_]/g, ' ').replace(/^(?:[IVXLCDM]+(?:[-_\s]))?/, '').trim();
    }
}

// --- Shared Constants ---
export const dataDir = path.resolve(process.cwd(), 'src/data/questions');
export const excludedFiles = ['placeholder.json'];
export const PRACTICE_TESTS_PER_MODULE = 5;
export const FINAL_TEST_ID_SUFFIX = 6;
export const QUESTIONS_PER_PRACTICE = 25;
export const QUESTIONS_PER_FINAL = 50;
// --- End Constants ---

// Mapping Roman numerals to numbers for sorting
const romanMap: { [key: string]: number } = {
    'I': 1, 'II': 2, 'III': 3, 'IV': 4, 'V': 5, 'VI': 6, 'VII': 7, 'VIII': 8, 'IX': 9, 'X': 10,
    'XI': 11, 'XII': 12, 'XIII': 13, 'XIV': 14, 'XV': 15, 'XVI': 16, 'XVII': 17, 'XVIII': 18, 'XIX': 19, 'XX': 20,
    'XXI': 21, 'XXII': 22, 'XXIII': 23 // Add more if needed
};

// Function to extract a sortable number from the filename
const getSortableValue = (filename: string): number => {
    // Try to match Roman numerals first (e.g., "I -", "II-A", "VIII -", "XIX-C")
    const romanMatch = filename.match(/^([IVXLCDM]+)(?:[-_\s\.])/i);
    if (romanMatch && romanMatch[1]) {
        const romanBase = romanMatch[1].toUpperCase();
        if (romanMap[romanBase]) {
            let value = romanMap[romanBase] * 10; // Base value (10, 20, 30...)
            
            // Handle sub-parts like A, B, C (e.g., II-A, II-B)
            const subMatch = filename.match(/^[IVXLCDM]+-([A-Z])/i);
            if (subMatch && subMatch[1]) {
                value += (subMatch[1].charCodeAt(0) - 'A'.charCodeAt(0)); // II-A -> 20, II-B -> 21
            }
            return value;
        }
    }
    // Handle files starting with XA, XB (like XA, XB)
    const xaMatch = filename.match(/^X([A-Z])/i);
     if (xaMatch && xaMatch[1]){
         return 100 + (xaMatch[1].toUpperCase().charCodeAt(0) - 'A'.charCodeAt(0));
     }
     if (filename.toUpperCase().startsWith('SEBI')) {
         return 1000;
     }
    return Infinity;
};

// Helper to find the correct module filename based on testId
export function findModuleFile(testIdNum: number): string | null {
    // Calculate 0-based index from 1xx, 2xx, etc.
    const moduleIndex = Math.floor((testIdNum - 101) / 100);
    if (moduleIndex < 0) {
        console.error(`Calculated invalid module index (${moduleIndex}) for test ID ${testIdNum}`);
        return null;
    }

    try {
        let filenames = fs.readdirSync(dataDir).filter(
          file => file.endsWith('.json') && !excludedFiles.includes(file)
        );

        // Sort filenames based on the Roman numeral logic
        filenames.sort((a, b) => getSortableValue(a) - getSortableValue(b));
        
        // Log only if needed (can be noisy)
        // console.log("Sorted Filenames for Module Lookup:", filenames); 

        if (moduleIndex >= filenames.length) {
            console.error(`Calculated module index (${moduleIndex}) is out of bounds for available files (${filenames.length}) for test ID ${testIdNum}`);
            return null;
        }

        const selectedFile = filenames[moduleIndex];
        console.log(`findModuleFile: For Test ID ${testIdNum} (Index ${moduleIndex}), using file: ${selectedFile}`);
        return selectedFile;

    } catch (error) {
        console.error("Error reading data directory or finding module file:", error);
        return null;
    }
};

// Test ID generation
export const getTestId = (moduleIndex: number, testNumber: number): number => {
  return (moduleIndex + 1) * 100 + testNumber;
};