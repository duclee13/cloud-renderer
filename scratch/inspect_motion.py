with open('web-studio/src/animscript/motionGraph.ts', encoding='utf-8') as f:
    lines = f.readlines()

print('Total lines in motionGraph.ts:', len(lines))
for i, line in enumerate(lines):
    if line.startswith('export '):
        print(f'{i+1}: {line.strip()}')
