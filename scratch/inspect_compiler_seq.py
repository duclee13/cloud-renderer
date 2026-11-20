with open('web-studio/src/animscript/compiler.ts', encoding='utf-8') as f:
    lines = f.readlines()

for i, l in enumerate(lines):
    if 'const compileStatements = ' in l:
        print(''.join(lines[i:i+60]))
        break
