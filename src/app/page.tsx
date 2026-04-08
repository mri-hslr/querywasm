// FILE: src/app/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { Lexer } from '@/lib/engine/lexer/lexer';
import { Parser } from '@/lib/engine/parser/parser';
import { Catalog } from '@/lib/engine/schema/catalog';
import { SemanticAnalyzer } from '@/lib/engine/analyzer/analyzer';
import { LogicalPlanner } from '@/lib/engine/planner/planner';
import { SelectStatement } from '@/lib/engine/parser/ast';
import { PlanNode } from '@/lib/engine/planner/planNodes';
import PlanVisualizer from '@/components/PlanVisualizer';

export default function Home() {
  const [query, setQuery] = useState("SELECT id, user_name FROM users WHERE age > 18;");
  const [plan, setPlan] = useState<PlanNode | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    try {
      setError(null); // Clear previous errors
      
      const lexer = new Lexer(query);
      const tokens = lexer.tokenize();
      
      const parser = new Parser(tokens);
      const ast = parser.parse();
      
      const catalog = new Catalog();
      const analyzer = new SemanticAnalyzer(catalog);
      analyzer.validate(ast);
      
      const planner = new LogicalPlanner();
      if (ast.type !== 'SelectStatement') throw new Error("Only SELECT supported.");
      
      const logicalPlan = planner.buildPlan(ast as SelectStatement);
      setPlan(logicalPlan);
      
    } catch (e: any) {
      setPlan(null);
      setError(e.message);
    }
  }, [query]);

  return (
    <div className="flex flex-col min-h-screen p-8 bg-zinc-950 text-white font-sans">
      <div className="max-w-6xl w-full mx-auto space-y-6">
        
        <div className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">QueryWasm</h1>
          <p className="text-zinc-400">In-Browser SQL Compiler & Analytics Engine</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* LEFT: Editor */}
          <div className="col-span-1 space-y-2">
            <h2 className="text-lg font-semibold text-zinc-300">SQL Input</h2>
            <textarea 
              className="w-full h-48 bg-zinc-900 border border-zinc-700 rounded-lg p-4 font-mono text-sm focus:outline-none focus:border-blue-500"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
            {error && (
              <div className="p-4 bg-red-950/50 border border-red-900 text-red-400 rounded-lg text-sm">
                {error}
              </div>
            )}
          </div>

          {/* RIGHT: Visualizer */}
          <div className="col-span-2 space-y-2">
            <h2 className="text-lg font-semibold text-zinc-300">Logical Execution Plan</h2>
            <PlanVisualizer plan={plan} />
          </div>

        </div>
      </div>
    </div>
  );
}