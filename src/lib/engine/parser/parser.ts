// FILE: src/lib/engine/parser/parser.ts

import { Token, TokenType } from '../lexer/types';
import { ASTNode, SelectStatement, IdentifierNode, BinaryExpressionNode, NumberLiteralNode } from './ast';

export class Parser {
  private tokens: Token[];
  private pos: number = 0;

  constructor(tokens: Token[]) {
    this.tokens = tokens;
  }

  // --- HELPER METHODS ---

  // Look at the current token without consuming it
  private peek(): Token {
    return this.tokens[this.pos];
  }

  // Grab the current token and move forward. Throw an error if it's the wrong type.
  private consume(expectedType: TokenType, expectedValue?: string): Token {
    const current = this.peek();
    
    if (current.type === TokenType.EOF && expectedType !== TokenType.EOF) {
      throw new Error(`Syntax Error: Unexpected End of File. Expected ${expectedType}`);
    }

    if (current.type !== expectedType || (expectedValue && current.value !== expectedValue)) {
      throw new Error(`Syntax Error at line ${current.line}, col ${current.column}: Expected ${expectedType} ${expectedValue ? `"${expectedValue}"` : ''}, but found ${current.type} "${current.value}"`);
    }

    this.pos++;
    return current;
  }

  // --- PARSING RULES ---

  public parse(): ASTNode {
    // For now, we assume the first word is SELECT. 
    // In a full engine, we'd check if it's SELECT, INSERT, CREATE, etc.
    return this.parseSelect();
  }

  private parseSelect(): SelectStatement {
    // 1. Consume 'SELECT'
    this.consume(TokenType.Keyword, 'SELECT');

    // 2. Parse Columns
    const columns: IdentifierNode[] = [];
    while (this.peek().type !== TokenType.Keyword && this.peek().value !== 'FROM') {
      const colToken = this.consume(TokenType.Identifier);
      columns.push({ type: 'Identifier', name: colToken.value });

      // If there's a comma, consume it and keep looping. Otherwise, break.
      if (this.peek().type === TokenType.Comma) {
        this.consume(TokenType.Comma);
      } else {
        break;
      }
    }

    // 3. Consume 'FROM'
    this.consume(TokenType.Keyword, 'FROM');

    // 4. Parse Table Name
    const tableToken = this.consume(TokenType.Identifier);
    const tableNode: IdentifierNode = { type: 'Identifier', name: tableToken.value };

    // 5. Parse Optional 'WHERE'
    let whereNode: BinaryExpressionNode | undefined = undefined;
    if (this.peek().type === TokenType.Keyword && this.peek().value === 'WHERE') {
      this.consume(TokenType.Keyword, 'WHERE');
      whereNode = this.parseBinaryExpression();
    }

    // 6. Consume optional Semicolon
    if (this.peek().type === TokenType.Semicolon) {
      this.consume(TokenType.Semicolon);
    }

    return {
      type: 'SelectStatement',
      columns,
      table: tableNode,
      where: whereNode
    };
  }

  // Parses simple conditions like "age > 18"
  private parseBinaryExpression(): BinaryExpressionNode {
    const leftToken = this.consume(TokenType.Identifier);
    const leftNode: IdentifierNode = { type: 'Identifier', name: leftToken.value };

    const operatorToken = this.consume(TokenType.Operator);
    
    const rightToken = this.consume(TokenType.Number);
    const rightNode: NumberLiteralNode = { type: 'NumberLiteral', value: Number(rightToken.value) };

    return {
      type: 'BinaryExpression',
      left: leftNode,
      operator: operatorToken.value,
      right: rightNode
    };
  }
}