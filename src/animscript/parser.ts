/**
 * AnimScript v0.1 Parser
 * Recursive descent parser generating typed AST with location metadata.
 */

import { Lexer, Token, TokenType } from "./lexer";
import {
  ProgramNode,
  StatementNode,
  AssignmentStatementNode,
  ExpressionStatementNode,
  WithSceneStatementNode,
  WithSequenceStatementNode,
  WithParallelStatementNode,
  ExpressionNode,
  NumberLiteralNode,
  StringLiteralNode,
  BooleanLiteralNode,
  CoordinateLiteralNode,
  IdentifierNode,
  PropertyAccessNode,
  BinaryExpressionNode,
  CallExpressionNode,
  CallArgument,
  NodeSpan,
  SourceLocation,
} from "./ast";
import { CompilerDiagnostic } from "./types";

export class Parser {
  private tokens: Token[] = [];
  private current = 0;
  public diagnostics: CompilerDiagnostic[] = [];

  constructor(private source: string) {}

  public parse(): { program: ProgramNode; diagnostics: CompilerDiagnostic[] } {
    const lexer = new Lexer(this.source);
    this.tokens = lexer.tokenize();
    this.current = 0;
    this.diagnostics = [];

    // Transfer lexer errors to diagnostics
    for (const le of lexer.errors) {
      this.diagnostics.push({
        code: le.code,
        message: le.message,
        line: le.line,
        column: le.column,
        severity: "error",
      });
    }

    const startLoc = this.getLoc();
    const body: StatementNode[] = [];

    this.skipNewlines();
    while (!this.isAtEnd()) {
      try {
        const stmt = this.parseStatement();
        if (stmt) {
          body.push(stmt);
        }
      } catch (err: any) {
        // Synchronize on error to next newline/dedent
        this.synchronize();
      }
      this.skipNewlines();
    }

    const endLoc = this.getLoc();
    const program: ProgramNode = {
      type: "Program",
      span: { start: startLoc, end: endLoc },
      body,
    };

    return { program, diagnostics: this.diagnostics };
  }

  private parseStatement(): StatementNode | null {
    this.skipNewlines();
    if (this.isAtEnd()) return null;

    // With statement (scene, sequence, parallel)
    if (this.matchKeyword("with")) {
      return this.parseWithStatement();
    }

    // Check for assignment: ID = Expr
    if (this.check("IDENTIFIER") && this.peekNext()?.type === "ASSIGN") {
      return this.parseAssignmentStatement();
    }

    // Otherwise: Expression statement
    const exprStart = this.getLoc();
    const expr = this.parseExpression();
    this.consumeNewlineOrEof("Mong đợi kết thúc dòng sau biểu thức.");
    return {
      type: "ExpressionStatement",
      span: { start: exprStart, end: expr.span.end },
      expression: expr,
    };
  }

  private parseWithStatement(): StatementNode {
    const startLoc = this.previous().line
      ? { line: this.previous().line, column: this.previous().column, offset: this.previous().offset }
      : this.getLoc();

    const blockTypeToken = this.consumeAny(
      ["IDENTIFIER", "KEYWORD"],
      "Mong đợi 'scene', 'sequence' hoặc 'parallel' sau 'with'."
    );
    const blockType = String(blockTypeToken.value);

    if (blockType === "scene") {
      this.consume("LPAREN", "Mong đợi '(' sau 'scene'.");
      const nameToken = this.consume("STRING", "Mong đợi tên cảnh trong cặp ngoặc kép sau scene(...).");
      const sceneName = String(nameToken.value);

      const options: Record<string, ExpressionNode> = {};
      while (!this.check("RPAREN") && !this.isAtEnd()) {
        if (this.match("COMMA")) continue;
        const optKey = this.consume("IDENTIFIER", "Mong đợi tên tham số tùy chọn cho scene.").value as string;
        this.consume("ASSIGN", `Mong đợi '=' sau tham số ${optKey}.`);
        options[optKey] = this.parseExpression();
      }
      this.consume("RPAREN", "Mong đợi ')' sau khai báo scene.");
      this.consume("COLON", "Mong đợi ':' ở cuối dòng khai báo 'with scene(...)'.");
      this.consumeNewline("Mong đợi xuống dòng sau dấu ':'.");

      const body = this.parseBlock();
      return {
        type: "WithSceneStatement",
        span: { start: startLoc, end: this.getLoc() },
        sceneName,
        options,
        body,
      };
    } else if (blockType === "sequence") {
      this.consume("LPAREN", "Mong đợi '(' sau 'sequence'.");
      this.consume("RPAREN", "Mong đợi ')' sau 'sequence('.");
      this.consume("COLON", "Mong đợi ':' ở cuối dòng khai báo 'with sequence():'.");
      this.consumeNewline("Mong đợi xuống dòng sau dấu ':'.");

      const body = this.parseBlock();
      return {
        type: "WithSequenceStatement",
        span: { start: startLoc, end: this.getLoc() },
        body,
      };
    } else if (blockType === "parallel") {
      this.consume("LPAREN", "Mong đợi '(' sau 'parallel'.");
      this.consume("RPAREN", "Mong đợi ')' sau 'parallel('.");
      this.consume("COLON", "Mong đợi ':' ở cuối dòng khai báo 'with parallel():'.");
      this.consumeNewline("Mong đợi xuống dòng sau dấu ':'.");

      const body = this.parseBlock();
      return {
        type: "WithParallelStatement",
        span: { start: startLoc, end: this.getLoc() },
        body,
      };
    }

    throw this.error(
      "ERR_INVALID_WITH_BLOCK",
      `Khối 'with ${blockType}' không được hỗ trợ. Chỉ hỗ trợ 'with scene(...)', 'with sequence():', hoặc 'with parallel():'.`,
      "Thay bằng 'with scene(...)', 'with sequence():' hoặc 'with parallel():'."
    );
  }

  private parseBlock(): StatementNode[] {
    this.consume("INDENT", "Mong đợi khối lệnh thụt lề vào.");
    const body: StatementNode[] = [];
    this.skipNewlines();

    while (!this.check("DEDENT") && !this.isAtEnd()) {
      const stmt = this.parseStatement();
      if (stmt) body.push(stmt);
      this.skipNewlines();
    }

    this.consume("DEDENT", "Mong đợi kết thúc khối thụt lề.");
    return body;
  }

  private parseAssignmentStatement(): AssignmentStatementNode {
    const idToken = this.consume("IDENTIFIER", "Mong đợi tên biến.");
    const target = String(idToken.value);
    this.consume("ASSIGN", "Mong đợi '='.");
    const value = this.parseExpression();
    this.consumeNewlineOrEof("Mong đợi kết thúc dòng sau phép gán.");

    return {
      type: "AssignmentStatement",
      span: {
        start: { line: idToken.line, column: idToken.column, offset: idToken.offset },
        end: value.span.end,
      },
      target,
      value,
    };
  }

  private parseExpression(): ExpressionNode {
    return this.parseBinaryExpression();
  }

  private parseBinaryExpression(): ExpressionNode {
    let left = this.parsePrimary();

    while (this.match("PLUS") || this.match("MINUS")) {
      const opToken = this.previous();
      const operator = opToken.type === "PLUS" ? "+" : "-";
      const right = this.parsePrimary();
      left = {
        type: "BinaryExpression",
        span: { start: left.span.start, end: right.span.end },
        operator,
        left,
        right,
      };
    }

    return left;
  }

  private parsePrimary(): ExpressionNode {
    // Number
    if (this.check("NUMBER")) {
      const token = this.advance();
      return {
        type: "NumberLiteral",
        span: this.tokenSpan(token),
        value: Number(token.value),
      };
    }

    // String
    if (this.check("STRING")) {
      const token = this.advance();
      return {
        type: "StringLiteral",
        span: this.tokenSpan(token),
        value: String(token.value),
      };
    }

    // Boolean
    if (this.check("BOOLEAN")) {
      const token = this.advance();
      return {
        type: "BooleanLiteral",
        span: this.tokenSpan(token),
        value: Boolean(token.value),
      };
    }

    // Coordinate / List: [x, y]
    if (this.match("LBRACKET")) {
      const startLoc = this.previousLoc();
      const elements: ExpressionNode[] = [];
      if (!this.check("RBRACKET")) {
        do {
          if (this.check("RBRACKET")) break;
          elements.push(this.parseExpression());
        } while (this.match("COMMA"));
      }
      const endToken = this.consume("RBRACKET", "Mong đợi ']' đóng danh sách tọa độ.");
      return {
        type: "CoordinateLiteral",
        span: { start: startLoc, end: this.tokenEndLoc(endToken) },
        elements,
      };
    }

    // Parenthesized expression: ( expr )
    if (this.match("LPAREN")) {
      const expr = this.parseExpression();
      this.consume("RPAREN", "Mong đợi ')' đóng ngoặc.");
      return expr;
    }

    // Identifier, PropertyAccess, or Function Call
    if (this.check("IDENTIFIER") || this.check("KEYWORD")) {
      const idToken = this.advance();
      let expr: ExpressionNode = {
        type: "Identifier",
        span: this.tokenSpan(idToken),
        name: String(idToken.value),
      };

      // Property access or function call loop
      while (true) {
        if (this.match("DOT")) {
          const propToken = this.consumeAny(
            ["IDENTIFIER", "KEYWORD"],
            "Mong đợi tên thuộc tính hoặc điểm neo sau dấu '.'."
          );
          expr = {
            type: "PropertyAccess",
            span: { start: expr.span.start, end: this.tokenEndLoc(propToken) },
            object: expr,
            property: String(propToken.value),
          };
        } else if (this.match("LPAREN")) {
          // Function call: expr must be identifier
          if (expr.type !== "Identifier") {
            throw this.error(
              "ERR_INVALID_CALL",
              "Chỉ có thể gọi trực tiếp hàm định danh, không thể gọi thuộc tính lồng."
            );
          }
          const args = this.parseCallArguments();
          const rparenToken = this.consume("RPAREN", "Mong đợi ')' đóng lời gọi hàm.");
          expr = {
            type: "CallExpression",
            span: { start: expr.span.start, end: this.tokenEndLoc(rparenToken) },
            callee: expr.name,
            args,
          };
        } else {
          break;
        }
      }

      return expr;
    }

    throw this.error(
      "ERR_UNEXPECTED_TOKEN",
      `Ký hiệu không mong đợi '${String(this.peek()?.value ?? "")}' (${this.peek()?.type}).`,
      "Kiểm tra lại cú pháp biểu thức."
    );
  }

  private parseCallArguments(): CallArgument[] {
    const args: CallArgument[] = [];
    if (this.check("RPAREN")) return args;

    do {
      if (this.check("RPAREN")) break;

      // Check if named argument: name = expr
      if (this.check("IDENTIFIER") && this.peekNext()?.type === "ASSIGN") {
        const nameToken = this.advance();
        this.advance(); // consume '='
        const val = this.parseExpression();
        args.push({ name: String(nameToken.value), value: val });
      } else {
        const val = this.parseExpression();
        args.push({ value: val });
      }
    } while (this.match("COMMA"));

    return args;
  }

  // --- Helper Methods ---

  private match(type: TokenType): boolean {
    if (this.check(type)) {
      this.advance();
      return true;
    }
    return false;
  }

  private matchKeyword(kw: string): boolean {
    if (this.check("KEYWORD") && this.peek()?.value === kw) {
      this.advance();
      return true;
    }
    return false;
  }

  private check(type: TokenType): boolean {
    if (this.isAtEnd()) return false;
    return this.peek().type === type;
  }

  private advance(): Token {
    if (!this.isAtEnd()) this.current++;
    return this.previous();
  }

  private isAtEnd(): boolean {
    return this.peek().type === "EOF";
  }

  private peek(): Token {
    return this.tokens[this.current] || { type: "EOF", value: "", line: 1, column: 1, offset: 0 };
  }

  private peekNext(): Token | undefined {
    return this.tokens[this.current + 1];
  }

  private previous(): Token {
    return this.tokens[this.current - 1];
  }

  private consume(type: TokenType, message: string): Token {
    if (this.check(type)) return this.advance();
    throw this.error(`ERR_EXPECTED_${type}`, message);
  }

  private consumeAny(types: TokenType[], message: string): Token {
    for (const t of types) {
      if (this.check(t)) return this.advance();
    }
    throw this.error("ERR_UNEXPECTED_TOKEN", message);
  }

  private consumeNewline(message: string): void {
    if (this.match("NEWLINE")) return;
    if (this.isAtEnd()) return;
    throw this.error("ERR_EXPECTED_NEWLINE", message);
  }

  private consumeNewlineOrEof(message: string): void {
    if (this.match("NEWLINE") || this.isAtEnd() || this.check("DEDENT")) return;
    throw this.error("ERR_EXPECTED_NEWLINE", message);
  }

  private skipNewlines(): void {
    while (this.match("NEWLINE")) {}
  }

  private getLoc(): SourceLocation {
    const t = this.peek();
    return { line: t.line, column: t.column, offset: t.offset };
  }

  private previousLoc(): SourceLocation {
    const t = this.previous();
    return { line: t.line, column: t.column, offset: t.offset };
  }

  private tokenSpan(t: Token): NodeSpan {
    return {
      start: { line: t.line, column: t.column, offset: t.offset },
      end: this.tokenEndLoc(t),
    };
  }

  private tokenEndLoc(t: Token): SourceLocation {
    const len = String(t.value).length;
    return {
      line: t.line,
      column: t.column + len,
      offset: t.offset + len,
    };
  }

  private error(code: string, message: string, fixSuggestion?: string): Error {
    const t = this.peek();
    this.diagnostics.push({
      code,
      message,
      line: t.line,
      column: t.column,
      severity: "error",
      fixSuggestion,
    });
    return new Error(`[${code}] ${message} tại dòng ${t.line}, cột ${t.column}`);
  }

  private synchronize(): void {
    this.advance();
    while (!this.isAtEnd()) {
      if (this.previous().type === "NEWLINE") return;
      if (this.check("KEYWORD") && this.peek().value === "with") return;
      this.advance();
    }
  }
}
