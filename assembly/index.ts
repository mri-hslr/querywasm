// FILE: assembly/index.ts

const ROW_SIZE: i32 = 8; 
let offsetPointer: i32 = 0; 
let rowCount: i32 = 0;

/**
 * Inserts a new row into linear memory safely.
 */
export function insertRow(id: i32, age: i32): void {
  // 1. MEMORY CHECK: Do we have enough space for the next row?
  // memory.size() returns the number of 64KB pages currently allocated.
  let currentMemoryBytes = memory.size() * 65536;
  
  if (offsetPointer + ROW_SIZE > currentMemoryBytes) {
    // We are out of space! Ask the CPU for 10 more pages (~640KB) at a time.
    memory.grow(10); 
  }

  // 2. Write the data
  store<i32>(offsetPointer, id);
  store<i32>(offsetPointer + 4, age);
  
  offsetPointer += ROW_SIZE;
  rowCount++;
}

export function getAgeAtRow(rowIndex: i32): i32 {
  let rowStartPointer: i32 = rowIndex * ROW_SIZE;
  return load<i32>(rowStartPointer + 4);
}

export function getIdAtRow(rowIndex: i32): i32 {
  let rowStartPointer: i32 = rowIndex * ROW_SIZE;
  return load<i32>(rowStartPointer);
}

export function getRowCount(): i32 {
  return rowCount;
}

// --- EXECUTION ENGINE ---

// We no longer hardcode this. It will be determined at execution time.
let currentResultsPointer: i32 = 0;

export function executeFilterAgeGreaterThan(minAge: i32): i32 {
  let matchCount: i32 = 0;
  
  // DYNAMIC POINTER: Start writing results immediately AFTER the last inserted row.
  // This guarantees we never overwrite our database!
  currentResultsPointer = offsetPointer;

  for (let i: i32 = 0; i < rowCount; i++) {
    let currentAge = getAgeAtRow(i);
    
    if (currentAge > minAge) {
      let currentId = getIdAtRow(i);
      let writeAddress = currentResultsPointer + (matchCount * 4);
      
      // MEMORY CHECK: Ensure our results buffer doesn't outgrow memory
      if (writeAddress + 4 > memory.size() * 65536) {
        memory.grow(1);
      }
      
      store<i32>(writeAddress, currentId);
      matchCount++;
    }
  }

  return matchCount;
}

export function getResultsPointer(): i32 {
  return currentResultsPointer;
}