// FILE: src/lib/engine/parser/ast.ts

export type NodeType = 
  | 'SelectStatement' 
  | 'Identifier' 
  | 'NumberLiteral' 
  | 'BinaryExpression';

export interface ASTNode {
  type: NodeType;
}

export interface IdentifierNode extends ASTNode {
  type: 'Identifier';
  name: string;
}

export interface NumberLiteralNode extends ASTNode {
  type: 'NumberLiteral';
  value: number;
}

export interface BinaryExpressionNode extends ASTNode {
  type: 'BinaryExpression';
  left: IdentifierNode; // E.g., 'age'
  operator: string;     // E.g., '>'
  right: NumberLiteralNode; // E.g., 18
}

export interface SelectStatement extends ASTNode {
  type: 'SelectStatement';
  columns: (IdentifierNode | '*')[];
  table: IdentifierNode;
  where?: BinaryExpressionNode;
}