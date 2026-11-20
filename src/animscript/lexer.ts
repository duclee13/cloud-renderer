/**
 * AnimScript v0.1 Lexer
 * Python-style indentation tokenization with line/column tracking.
 */

export type TokenType =
  | "IDENTIFIER"
  | "KEYWORD"
  | "NUMBER"
  | "STRING"
  | "BOOLEAN"
  | "ASSIGN"         // =
  | "LPAREN"         // (
  | "RPAREN"         // )
  | "LBRACKET"       // [
  | "RBRACKET"       // ]
  | "COMMA"          // ,
  | "DOT"            // .
  | "COLON"          // :
  | "PLUS"           // +
  | "MINUS"          // -
  | "NEWLINE"
  | "INDENT"
  | "DEDENT"
  | "EOF";

export interface Token {
  type: TokenType;
  value: string | number | boolean;
  line: number;   // 1-based
  column: number; // 1-based
  offset: number; // 0-based
}

export interface LexerError {
  code: string;
  message: string;
  line: number;
  column: number;
}

const KEYWORDS = new Set(["with", "as", "in", "scene", "sequence", "parallel"]);

export class Lexer {
  private src: string;
  private pos = 0;
  private line = 1;
  private col = 1;
  private indentStack: number[] = [0];
  private parenDepth = 0;
  private tokens: Token[] = [];
  public errors: LexerError[] = [];

  constructor(source: string) {
    this.src = source.replace(/\r\n/g, "\n").replace(/\r/g, "\n");
  }

  public tokenize(): Token[] {
    this.tokens = [];
    this.indentStack = [0];
    this.parenDepth = 0;
    this.errors = [];
    this.pos = 0;
    this.line = 1;
    this.col = 1;

    let isLineStart = true;

    while (this.pos < this.src.length) {
      if (isLineStart && this.parenDepth === 0) {
        // Read indentation of new line
        const indentStartLine = this.line;
        const indentStartCol = this.col;
        const indentStartPos = this.pos;

        let indentSpaces = 0;
        while (this.pos < this.src.length) {
          const ch = this.src[this.pos];
          if (ch === " ") {
            indentSpaces++;
            this.advance();
          } else if (ch === "\t") {
            indentSpaces += 4; // Tab counts as 4 spaces
            this.advance();
          } else {
            break;
          }
        }

        // Check if blank line or comment
        if (this.pos < this.src.length) {
          const ch = this.src[this.pos];
          if (ch === "\n") {
            this.advance();
            continue; // Ignore blank lines
          }
          if (ch === "#") {
            this.skipComment();
            if (this.pos < this.src.length && this.src[this.pos] === "\n") {
              this.advance();
            }
            continue; // Ignore comment-only lines
          }
        } else {
          break;
        }

        // Now process indentation level
        const currentIndent = this.indentStack[this.indentStack.length - 1];
        if (indentSpaces > currentIndent) {
          this.indentStack.push(indentSpaces);
          this.tokens.push({
            type: "INDENT",
            value: indentSpaces,
            line: indentStartLine,
            column: indentStartCol,
            offset: indentStartPos,
          });
        } else if (indentSpaces < currentIndent) {
          while (
            this.indentStack.length > 1 &&
            this.indentStack[this.indentStack.length - 1] > indentSpaces
          ) {
            this.indentStack.pop();
            this.tokens.push({
              type: "DEDENT",
              value: indentSpaces,
              line: indentStartLine,
              column: indentStartCol,
              offset: indentStartPos,
            });
          }
          if (this.indentStack[this.indentStack.length - 1] !== indentSpaces) {
            this.errors.push({
              code: "ERR_UNINDENT_MISMATCH",
              message: `Mức thụt lề (${indentSpaces} khoảng trắng) không khớp mức nào trước đó.`,
              line: indentStartLine,
              column: indentStartCol,
            });
          }
        }
        isLineStart = false;
      }

      const ch = this.src[this.pos];

      // Skip whitespace within line
      if (ch === " " || ch === "\t") {
        this.advance();
        continue;
      }

      // Comments
      if (ch === "#") {
        this.skipComment();
        continue;
      }

      // Newline
      if (ch === "\n") {
        const line = this.line;
        const col = this.col;
        const offset = this.pos;
        this.advance();
        if (this.parenDepth === 0) {
          // Only emit NEWLINE if previous token is not already NEWLINE or INDENT
          const prev = this.tokens[this.tokens.length - 1];
          if (prev && prev.type !== "NEWLINE" && prev.type !== "INDENT") {
            this.tokens.push({ type: "NEWLINE", value: "\n", line, column: col, offset });
          }
          isLineStart = true;
        }
        continue;
      }

      // Parens / Brackets
      if (ch === "(") {
        this.parenDepth++;
        this.emit("LPAREN", "(");
        continue;
      }
      if (ch === ")") {
        this.parenDepth = Math.max(0, this.parenDepth - 1);
        this.emit("RPAREN", ")");
        continue;
      }
      if (ch === "[") {
        this.parenDepth++;
        this.emit("LBRACKET", "[");
        continue;
      }
      if (ch === "]") {
        this.parenDepth = Math.max(0, this.parenDepth - 1);
        this.emit("RBRACKET", "]");
        continue;
      }

      // Operators and punctuation
      if (ch === "=") {
        this.emit("ASSIGN", "=");
        continue;
      }
      if (ch === ":") {
        this.emit("COLON", ":");
        continue;
      }
      if (ch === ",") {
        this.emit("COMMA", ",");
        continue;
      }
      if (ch === ".") {
        this.emit("DOT", ".");
        continue;
      }
      if (ch === "+") {
        this.emit("PLUS", "+");
        continue;
      }
      if (ch === "-") {
        // Can be minus or part of negative number
        const nextChar = this.peek(1);
        const prev = this.tokens[this.tokens.length - 1];
        const isUnary = !prev || prev.type === "ASSIGN" || prev.type === "COMMA" || prev.type === "LPAREN" || prev.type === "LBRACKET" || prev.type === "COLON" || prev.type === "PLUS" || prev.type === "MINUS";
        if (isUnary && nextChar && /[0-9]/.test(nextChar)) {
          this.readNumber();
        } else {
          this.emit("MINUS", "-");
        }
        continue;
      }

      // Strings
      if (ch === '"' || ch === "'") {
        this.readString(ch);
        continue;
      }

      // Numbers
      if (/[0-9]/.test(ch)) {
        this.readNumber();
        continue;
      }

      // Identifiers / Keywords / Booleans
      if (/[a-zA-Z_]/.test(ch)) {
        this.readIdentifier();
        continue;
      }

      // Unknown character
      this.errors.push({
        code: "ERR_UNEXPECTED_CHAR",
        message: `Ký tự không hợp lệ '${ch}'.`,
        line: this.line,
        column: this.col,
      });
      this.advance();
    }

    // Emit trailing NEWLINE and DEDENTs if needed
    const prev = this.tokens[this.tokens.length - 1];
    if (prev && prev.type !== "NEWLINE") {
      this.tokens.push({
        type: "NEWLINE",
        value: "\n",
        line: this.line,
        column: this.col,
        offset: this.pos,
      });
    }

    while (this.indentStack.length > 1) {
      this.indentStack.pop();
      this.tokens.push({
        type: "DEDENT",
        value: 0,
        line: this.line,
        column: this.col,
        offset: this.pos,
      });
    }

    this.tokens.push({
      type: "EOF",
      value: "",
      line: this.line,
      column: this.col,
      offset: this.pos,
    });

    return this.tokens;
  }

  private advance() {
    if (this.pos < this.src.length) {
      if (this.src[this.pos] === "\n") {
        this.line++;
        this.col = 1;
      } else {
        this.col++;
      }
      this.pos++;
    }
  }

  private peek(offset = 0): string {
    const p = this.pos + offset;
    return p < this.src.length ? this.src[p] : "";
  }

  private emit(type: TokenType, val: string | number | boolean) {
    this.tokens.push({
      type,
      value: val,
      line: this.line,
      column: this.col,
      offset: this.pos,
    });
    this.advance();
  }

  private skipComment() {
    while (this.pos < this.src.length && this.src[this.pos] !== "\n") {
      this.advance();
    }
  }

  private readString(quote: string) {
    const startLine = this.line;
    const startCol = this.col;
    const startPos = this.pos;

    this.advance(); // skip opening quote
    let str = "";

    while (this.pos < this.src.length) {
      const ch = this.src[this.pos];
      if (ch === quote) {
        this.advance(); // skip closing quote
        this.tokens.push({
          type: "STRING",
          value: str,
          line: startLine,
          column: startCol,
          offset: startPos,
        });
        return;
      }
      if (ch === "\\") {
        this.advance();
        const esc = this.src[this.pos];
        if (esc === "n") str += "\n";
        else if (esc === "t") str += "\t";
        else if (esc === "\\" || esc === '"' || esc === "'") str += esc;
        else str += esc;
        this.advance();
      } else if (ch === "\n") {
        this.errors.push({
          code: "ERR_UNTERMINATED_STRING",
          message: "Chuỗi chưa được đóng trước khi xuống dòng.",
          line: startLine,
          column: startCol,
        });
        return;
      } else {
        str += ch;
        this.advance();
      }
    }

    this.errors.push({
      code: "ERR_UNTERMINATED_STRING",
      message: "Chuỗi chưa được đóng trước khi kết thúc tập tin.",
      line: startLine,
      column: startCol,
    });
  }

  private readNumber() {
    const startLine = this.line;
    const startCol = this.col;
    const startPos = this.pos;

    let numStr = "";
    if (this.src[this.pos] === "-") {
      numStr += "-";
      this.advance();
    }

    let hasDot = false;
    while (this.pos < this.src.length) {
      const ch = this.src[this.pos];
      if (/[0-9]/.test(ch)) {
        numStr += ch;
        this.advance();
      } else if (ch === "." && !hasDot && /[0-9]/.test(this.peek(1))) {
        hasDot = true;
        numStr += ch;
        this.advance();
      } else {
        break;
      }
    }

    const val = hasDot ? parseFloat(numStr) : parseInt(numStr, 10);
    this.tokens.push({
      type: "NUMBER",
      value: val,
      line: startLine,
      column: startCol,
      offset: startPos,
    });
  }

  private readIdentifier() {
    const startLine = this.line;
    const startCol = this.col;
    const startPos = this.pos;

    let id = "";
    while (this.pos < this.src.length && /[a-zA-Z0-9_]/.test(this.src[this.pos])) {
      id += this.src[this.pos];
      this.advance();
    }

    if (id === "True" || id === "true") {
      this.tokens.push({ type: "BOOLEAN", value: true, line: startLine, column: startCol, offset: startPos });
    } else if (id === "False" || id === "false") {
      this.tokens.push({ type: "BOOLEAN", value: false, line: startLine, column: startCol, offset: startPos });
    } else if (KEYWORDS.has(id)) {
      this.tokens.push({ type: "KEYWORD", value: id, line: startLine, column: startCol, offset: startPos });
    } else {
      this.tokens.push({ type: "IDENTIFIER", value: id, line: startLine, column: startCol, offset: startPos });
    }
  }
}
