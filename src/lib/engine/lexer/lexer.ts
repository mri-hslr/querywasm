// FILE: src/lib/engine/lexer/lexer.ts

import { Token, TokenType, SQL_KEYWORDS } from './types';

export class Lexer {
  private input: string;
  private pos: number = 0;
  private line: number = 1;
  private column: number = 1;

  constructor(input: string) {
    this.input = input;
  }

  public tokenize(): Token[] {
    const tokens: Token[] = [];

    while (this.pos < this.input.length) {
      const char = this.input[this.pos];

      // 1. Skip Whitespace
      if (/\s/.test(char)) {
        this.skipWhitespace();
        continue;
      }

      // 2. Read Identifiers and Keywords (Starts with a letter or underscore)
      if (/[a-zA-Z_]/.test(char)) {
        tokens.push(this.readWord());
        continue;
      }

      // 3. Read Numbers
      if (/[0-9]/.test(char)) {
        tokens.push(this.readNumber());
        continue;
      }

      // 4. Read Operators and Punctuation
      switch (char) {
        case '*':
          tokens.push(this.createToken(TokenType.Asterisk, '*'));
          this.advance();
          break;
        case ',':
          tokens.push(this.createToken(TokenType.Comma, ','));
          this.advance();
          break;
        case ';':
          tokens.push(this.createToken(TokenType.Semicolon, ';'));
          this.advance();
          break;
        case '=':
        case '<':
        case '>':
        case '+':
        case '-':
          tokens.push(this.createToken(TokenType.Operator, char));
          this.advance();
          break;
        case '(':
          tokens.push(this.createToken(TokenType.LeftParen, '('));
          this.advance();
          break;
        case ')':
          tokens.push(this.createToken(TokenType.RightParen, ')'));
          this.advance();
          break;
        default:
          throw new Error(`Lexical Error: Unexpected character "${char}" at line ${this.line}, column ${this.column}`);
      }
    }

    // Always append an EOF (End of File) token so the Parser knows when to stop
    tokens.push(this.createToken(TokenType.EOF, ''));
    return tokens;
  }

  // Helper to move the pointer forward and track line/column position
  private advance(): string {
    const char = this.input[this.pos];
    if (char === '\n') {
      this.line++;
      this.column = 1;
    } else {
      this.column++;
    }
    this.pos++;
    return char;
  }

  private skipWhitespace(): void {
    while (this.pos < this.input.length && /\s/.test(this.input[this.pos])) {
      this.advance();
    }
  }

  // Implements the "Maximal Munch" principle for words
  private readWord(): Token {
    const startCol = this.column;
    const startOffset = this.pos;
    let value = '';

    while (this.pos < this.input.length && /[a-zA-Z0-9_]/.test(this.input[this.pos])) {
      value += this.advance();
    }

    // Normalization check against our Set in types.ts
    const upperValue = value.toUpperCase();
    const type = SQL_KEYWORDS.has(upperValue) ? TokenType.Keyword : TokenType.Identifier;

    return {
      type,
      // If it's a keyword, store the normalized uppercase version. Otherwise, keep the exact casing.
      value: type === TokenType.Keyword ? upperValue : value,
      line: this.line,
      column: startCol,
      offset: startOffset
    };
  }

  private readNumber(): Token {
    const startCol = this.column;
    const startOffset = this.pos;
    let value = '';

    while (this.pos < this.input.length && /[0-9]/.test(this.input[this.pos])) {
      value += this.advance();
    }

    return {
      type: TokenType.Number,
      value,
      line: this.line,
      column: startCol,
      offset: startOffset
    };
  }

  private createToken(type: TokenType, value: string): Token {
    return {
      type,
      value,
      line: this.line,
      column: this.column,
      offset: this.pos
    };
  }
}