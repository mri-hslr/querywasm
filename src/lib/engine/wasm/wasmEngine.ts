// FILE: src/lib/engine/wasm/wasmEngine.ts

export class WasmEngine {
  private wasmModule: any = null;
  private memory: WebAssembly.Memory | null = null;
  public isReady: boolean = false;

  public async init() {
    try {
      // 1. Fetch the compiled binary
      const response = await fetch('/release.wasm');
      const buffer = await response.arrayBuffer();

      // 2. Instantiate it (AssemblyScript requires an 'env.abort' function)
      const module = await WebAssembly.instantiate(buffer, {
        env: {
          abort: (message: any, fileName: any, lineNumber: any, columnNumber: any) => {
            console.error(`Wasm abort at ${lineNumber}:${columnNumber}`);
          }
        }
      });

      this.wasmModule = module.instance.exports;
      this.memory = this.wasmModule.memory as WebAssembly.Memory;
      this.isReady = true;
      console.log("✅ Wasm Engine Initialized successfully.");
    } catch (e) {
      console.error("❌ Failed to initialize Wasm Engine:", e);
    }
  }

  // Wrapper for inserting data
  public insertRow(id: number, age: number) {
    if (!this.isReady) return;
    this.wasmModule.insertRow(id, age);
  }

  public getRowCount(): number {
    if (!this.isReady) return 0;
    return this.wasmModule.getRowCount();
  }

  // The core Execution Bridge
  public executeFilter(minAge: number): number[] {
    if (!this.isReady) return [];

    // 1. Tell Wasm to run the loop. It returns the NUMBER of matches.
    const matchCount = this.wasmModule.executeFilterAgeGreaterThan(minAge);
    
    if (matchCount === 0) return [];

    // 2. Ask Wasm exactly WHERE in memory it put the results
    const resultsPointer = this.wasmModule.getResultsPointer();

    // 3. THE MAGIC: Create a direct view into the Wasm linear memory.
    // We start at the resultsPointer, and read exactly 'matchCount' integers.
    const memoryView = new Int32Array(this.memory!.buffer, resultsPointer, matchCount);

    // 4. Copy the data out of Wasm into a standard JS array for React to render
    return Array.from(memoryView);
  }
}