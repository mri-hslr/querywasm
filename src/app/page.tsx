// FILE: src/app/page.tsx
'use client';

import { useEffect } from 'react';
import { Lexer } from '@/lib/engine/lexer/lexer';
import { Parser } from '@/lib/engine/parser/parser';
export default function Home() {
  useEffect(() => {
    const testQuery = `
      SELECT id, user_name 
      FROM users 
      WHERE age > 18;
    `;
    
    try {
      // 1. Lexical Analysis
      const lexer = new Lexer(testQuery);
      const tokens = lexer.tokenize();
      
      // 2. Syntactic Analysis
      const parser = new Parser(tokens);
      const ast = parser.parse();
      
      console.log("AST OUTPUT:", JSON.stringify(ast, null, 2));
    } catch (e) {
      console.error(e);
    }
  }, []);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-8 bg-zinc-50 dark:bg-black text-black dark:text-white">
      <h1 className="text-2xl font-bold mb-4">QueryWasm Compiler</h1>
      <p>Open your browser console (F12) to see the Lexer output!</p>
    </div>
  );
}