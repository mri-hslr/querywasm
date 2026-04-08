 QueryWasm — In-Browser SQL Compiler & Visualizer

A client-side SQL compiler that transforms queries into logical execution plans and visualizes them in real-time.



 What This Project Actually Is

QueryWasm is not a database.

It is a compiler pipeline for SQL, built in the browser, that:
	1.	Tokenizes raw SQL
	2.	Parses it into an AST
	3.	Validates it semantically using a schema (Catalog)
	4.	Converts it into a Logical Execution Plan
	5.	Visualizes the plan as a graph

If you don’t understand compilers, this project will expose that very quickly.



 Core Pipeline
SQL Query
   ↓
Lexer (Tokenizer)
   ↓
Parser (AST Generator)
   ↓
Semantic Analyzer (Schema Validation)
   ↓
Logical Planner (Relational Algebra Tree)
   ↓
Plan Visualizer (Graph UI)


 Tech Stack
	•	Frontend: Next.js (App Router)
	•	Language: TypeScript
	•	Graph Rendering: React Flow
	•	Styling: Tailwind CSS



 Features

 Lexer (Tokenizer)
	•	Converts raw SQL → structured tokens
	•	Handles:
	•	Keywords (SELECT, FROM, etc.)
	•	Identifiers
	•	Numbers
	•	Operators & punctuation
	•	Implements:
	•	DFA (state machine)
	•	Maximal munch
	•	Keyword normalization



 Parser (AST Builder)
	•	Converts tokens → Abstract Syntax Tree
	•	Supports:
	•	SELECT
	•	FROM
	•	WHERE (binary expressions only)



 Semantic Analyzer (Validator)
	•	Validates queries against a schema (Catalog)
	•	Checks:
	•	Table existence
	•	Column existence
	•	Basic type correctness



 Catalog (Schema Registry)

Hardcoded virtual database:
{
  "users": {
    "id": "INT",
    "user_name": "TEXT",
    "age": "INT",
    "is_active": "BOOLEAN"
  },
  "products": {
    "id": "INT",
    "title": "TEXT",
    "price": "INT"
  }
}
Logical Planner
	•	Converts AST → Logical Plan Tree
	•	Operators:
	•	Scan
	•	Filter
	•	Project



 Plan Visualizer (UI)
	•	Renders logical plan as a graph
	•	Real-time updates while typing
	•	Instant error feedback



 Demo Behavior

Valid Query
SELECT id, user_name FROM users WHERE age > 18;

Output:
Project → Filter → Scan

Semantic Error
SELECT price FROM users;

Error:
Column 'price' does not exist in table 'users'

Error:
Expected Operator, found Semicolon





 Getting Started

1. Clone the repo

git clone <your-repo-url>
cd querywasm

2. Install dependencies
npm install

3. Run the dev server
npm run dev 

4. Open in browser
http://localhost:3000

 How to Test (Do This Properly)

Test 1 — Valid Query
SELECT title, price FROM products;
 Should render graph
Test 2 — Semantic Failure
SELECT price FROM users;

Should show semantic error
Test 3 — Syntax Failure
SELECT id FROM users WHERE age;

Should show parser error
