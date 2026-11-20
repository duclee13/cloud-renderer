with open('web-studio/src/animscript/ast.ts', encoding='utf-8') as f:
    lines = f.readlines()

for i, l in enumerate(lines):
    if 'type CallArgument' in l or 'interface CallArgument' in l:
        print(''.join(lines[max(0, i-2):i+15]))
        break
