with open('web-studio/src/animscript/ast.ts', encoding='utf-8') as f:
    lines = f.readlines()

for i, l in enumerate(lines):
    if 'CallArgument' in l or 'CallExpressionNode' in l:
        print(''.join(lines[max(0, i-5):i+25]))
        break
