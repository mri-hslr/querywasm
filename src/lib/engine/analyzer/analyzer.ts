// FILE: src/lib/engine/analyzer/analyzer.ts

import { ASTNode, SelectStatement, IdentifierNode, BinaryExpressionNode } from '../parser/ast';
import { Catalog } from '../schema/catalog';

export class SemanticAnalyzer {
  private catalog: Catalog;

  constructor(catalog: Catalog) {
    this.catalog = catalog;
  }

  // The main entry point for validation
  public validate(ast: ASTNode): void {
    if (ast.type === 'SelectStatement') {
      this.validateSelect(ast as SelectStatement);
    } else {
      throw new Error(`Semantic Error: Unsupported AST Node type '${ast.type}'`);
    }
  }

  private validateSelect(stmt: SelectStatement): void {
    const tableName = stmt.table.name;

    // 1. Check if Table Exists
    if (!this.catalog.hasTable(tableName)) {
      throw new Error(`Semantic Error: Table '${tableName}' does not exist.`);
    }

    // 2. Check if Columns Exist in that Table
    for (const col of stmt.columns) {
      if (col === '*') continue; // Wildcards are always valid syntactically
      
      const colName = (col as IdentifierNode).name;
      if (!this.catalog.hasColumn(tableName, colName)) {
        throw new Error(`Semantic Error: Column '${colName}' does not exist in table '${tableName}'.`);
      }
    }

    // 3. Type Checking the WHERE clause
    if (stmt.where) {
      this.validateWhereClause(stmt.where, tableName);
    }
  }

  private validateWhereClause(expr: BinaryExpressionNode, tableName: string): void {
    const leftColName = expr.left.name;

    // Ensure the column we are filtering on actually exists
    if (!this.catalog.hasColumn(tableName, leftColName)) {
      throw new Error(`Semantic Error: Column '${leftColName}' in WHERE clause does not exist in table '${tableName}'.`);
    }

    const expectedType = this.catalog.getColumnType(tableName, leftColName);
    const rightNodeType = expr.right.type;

    // Basic Type Inference & Checking
    // If the column is an INT, the right side must be a NumberLiteral
    if (expectedType === 'INT' && rightNodeType !== 'NumberLiteral') {
      throw new Error(`Type Mismatch: Column '${leftColName}' expects an INT, but received ${rightNodeType}.`);
    }
    
    // In a full compiler, we would add checks for TEXT vs StringLiteral, etc.
  }
}