// FILE: src/app/page.tsx
'use client';

import { useState, useEffect, useRef } from 'react';
import { Lexer } from '@/lib/engine/lexer/lexer';
import { Parser } from '@/lib/engine/parser/parser';
import { Catalog } from '@/lib/engine/schema/catalog';
import { SemanticAnalyzer } from '@/lib/engine/analyzer/analyzer';
import { LogicalPlanner } from '@/lib/engine/planner/planner';
import { SelectStatement, BinaryExpressionNode, NumberLiteralNode } from '@/lib/engine/parser/ast';
import { PlanNode } from '@/lib/engine/planner/planNodes';
import PlanVisualizer from '@/components/PlanVisualizer';
import { WasmEngine } from '@/lib/engine/wasm/wasmEngine';

export default function Home() {
  const [query, setQuery] = useState("SELECT id FROM users WHERE age > 18;");
  const [plan, setPlan] = useState<PlanNode | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [executionResults, setExecutionResults] = useState<{ time: number, count: number, sample: number[] } | null>(null);
  
  // Keep the engine in a ref so it persists across renders
  const engineRef = useRef<WasmEngine | null>(null);

  // Initialize Wasm and insert 100,000 dummy rows on mount
  useEffect(() => {
    async function loadEngine() {
      const engine = new WasmEngine();
      await engine.init();
      
      // Seed 100,000 rows of dummy data directly into Wasm Memory
      console.log("Seeding 100,000 rows into Wasm...");
      for (let i = 0; i < 100000; i++) {
        // IDs are 1 to 100,000. Ages are random between 10 and 60.
        const randomAge = Math.floor(Math.random() * 50) + 10;
        engine.insertRow(i + 1, randomAge);
      }
      console.log(`Seeded ${engine.getRowCount()} rows.`);
      engineRef.current = engine;
    }
    loadEngine();
  }, []);

  // Compile Phase
  useEffect(() => {
    try {
      setError(null);
      const lexer = new Lexer(query);
      const tokens = lexer.tokenize();
      const parser = new Parser(tokens);
      const ast = parser.parse();
      const catalog = new Catalog();
      const analyzer = new SemanticAnalyzer(catalog);
      analyzer.validate(ast);
      const planner = new LogicalPlanner();
      if (ast.type !== 'SelectStatement') throw new Error("Only SELECT supported.");
      setPlan(planner.buildPlan(ast as SelectStatement));
    } catch (e: any) {
      setPlan(null);
      setError(e.message);
    }
  }, [query]);

  // Execute Phase
  const handleExecute = () => {
    if (!engineRef.current || !engineRef.current.isReady) {
      alert("Wasm Engine is not ready yet!");
      return;
    }
    if (!plan || error) {
      alert("Fix query errors before executing.");
      return;
    }

    // 1. Hacky extraction of the 'minAge' from our AST for the prototype
    // We assume the query is exactly format: WHERE age > X
    try {
      // Traverse to find the Filter condition number
      const parser = new Parser(new Lexer(query).tokenize());
      const ast = parser.parse() as SelectStatement;
      const condition = ast.where as BinaryExpressionNode;
      const minAge = (condition.right as NumberLiteralNode).value;

      // 2. Start performance timer
      const startTime = performance.now();

      // 3. EXECUTE IN WASM
      const resultIds = engineRef.current.executeFilter(minAge);

      // 4. End performance timer
      const endTime = performance.now();

      setExecutionResults({
        time: endTime - startTime,
        count: resultIds.length,
        sample: resultIds.slice(0, 10) // Show first 10 matches
      });
    } catch (e) {
      alert("Execution failed. Ensure query matches: WHERE age > [number]");
    }
  };

  return (
    <div className="flex flex-col min-h-screen p-8 bg-zinc-950 text-white font-sans">
      <div className="max-w-6xl w-full mx-auto space-y-6">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">QueryWasm</h1>
          <p className="text-zinc-400">In-Browser SQL Compiler & Analytics Engine</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="col-span-1 space-y-4">
            <div className="space-y-2">
              <h2 className="text-lg font-semibold text-zinc-300">SQL Input</h2>
              <textarea 
                className="w-full h-32 bg-zinc-900 border border-zinc-700 rounded-lg p-4 font-mono text-sm focus:outline-none focus:border-blue-500"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
              {error && (
                <div className="p-4 bg-red-950/50 border border-red-900 text-red-400 rounded-lg text-sm">
                  {error}
                </div>
              )}
            </div>

            <button 
              onClick={handleExecute}
              className="w-full py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-lg transition-colors disabled:opacity-50"
              disabled={!!error || !plan}
            >
              Execute in WebAssembly 
            </button>

            {executionResults && (
              <div className="p-4 bg-zinc-900 border border-zinc-700 rounded-lg space-y-2">
                <h3 className="font-bold text-green-400">Execution Complete</h3>
                <p className="text-sm text-zinc-300">Filtered <span className="font-bold text-white">100,000</span> rows.</p>
                <p className="text-sm text-zinc-300">Rows matched: <span className="font-bold text-white">{executionResults.count}</span></p>
                <p className="text-sm text-zinc-300">Time taken: <span className="font-bold text-yellow-400">{executionResults.time.toFixed(2)} ms</span></p>
                
                <div className="pt-2">
                  <p className="text-xs text-zinc-500 mb-1">First 10 matching IDs:</p>
                  <div className="flex flex-wrap gap-2">
                    {executionResults.sample.map(id => (
                      <span key={id} className="bg-zinc-800 px-2 py-1 rounded text-xs border border-zinc-700">{id}</span>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="col-span-2 space-y-2">
            <h2 className="text-lg font-semibold text-zinc-300">Logical Execution Plan</h2>
            <PlanVisualizer plan={plan} />
          </div>
        </div>
      </div>
    </div>
  );
}