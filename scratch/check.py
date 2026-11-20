import re
with open('web-studio/src/animscript/runtime.ts', encoding='utf-8') as f:
    code = f.read()
cases = re.findall(r'case\s+"([^"]+)":', code)
print(list(dict.fromkeys(cases)))
