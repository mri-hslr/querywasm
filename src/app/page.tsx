// FILE: src/app/page.tsx
'use client';

import { useEffect } from 'react';
import { Lexer } from '@/lib/engine/lexer/lexer';
import { Parser } from '@/lib/engine/parser/parser';
import { Catalog } from '@/lib/engine/schema/catalog';
import { SemanticAnalyzer } from '@/lib/engine/analyzer/analyzer';

export default function Home() {
  useEffect(() => {
    // We are deliberately trying to trigger a Semantic Error here!
    // Change 'age' to 'flying_cars' to test the failure.
    // Change '18' to a string (if your parser supported it) to test type mismatch.
    const testQuery = `
      SELECT id, user_name 
      FROM users 
      WHERE age > 18; 
    `;
    
    try {
      console.log("--- COMPILER PIPELINE START ---");
      
      const lexer = new Lexer(testQuery);
      const tokens = lexer.tokenize();
      
      const parser = new Parser(tokens);
      const ast = parser.parse();
      
      const catalog = new Catalog();
      const analyzer = new SemanticAnalyzer(catalog);
      
      // If this passes without throwing an error, the query is mathematically and semantically sound.
      analyzer.validate(ast);
      
      console.log("✅ SEMANTIC ANALYSIS PASSED. AST is valid.");
      console.log(JSON.stringify(ast, null, 2));
      
    } catch (e) {
      console.error("❌ COMPILER ERROR:", e);
    }
  }, []);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-8 bg-zinc-50 dark:bg-black text-black dark:text-white">
      <h1 className="text-2xl font-bold mb-4">QueryWasm Compiler Pipeline</h1>
      <p>Open your browser console to see the Semantic Analyzer in action.</p>
    </div>
  );
}