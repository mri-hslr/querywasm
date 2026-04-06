export enum TokenType {
    Keyword = 'Keyword',
    Identifier = 'Identifier', // Table or Column names
    Number = 'Number',
    Operator = 'Operator',     // =, <, >, +, -
    Asterisk = 'Asterisk',     // Specific for SELECT *
    Comma = 'Comma',
    Semicolon = 'Semicolon',
    LeftParen = 'LeftParen',
    RightParen = 'RightParen',
    EOF = 'EOF',               // End of File/Stream
  }
  
  export interface Token {
    type: TokenType;
    value: string;      // The literal text (e.g., "SELECT" or "users")
    line: number;       // For error reporting
    column: number;     // For error reporting
    offset: number;     // The absolute position in the string (useful for syntax highlighting)
  }
  
  // These are the only keywords our engine will support for now.
  // We use a Set for O(1) lookup speed.
  export const SQL_KEYWORDS = new Set([
    'SELECT',
    'FROM',
    'WHERE',
    'INSERT',
    'INTO',
    'VALUES',
    'CREATE',
    'TABLE',
    'INT',
    'TEXT'
  ]);