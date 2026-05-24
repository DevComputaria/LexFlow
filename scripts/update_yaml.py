import glob
import os
import re

def get_val(content, key):
    m = re.search(rf'^{key}:\s*(.*)', content, re.MULTILINE)
    if m:
        return m.group(1).strip().strip('"')
    return ""

def process_file(file_path):
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()

    # Determine context
    if 'bcb-rc-16' in file_path:
        contexto = 'baas'
    elif 'bcb-rc-17' in file_path:
        contexto = 'nomenclatura_apresentacao_publico'
    else:
        contexto = 'unknown'

    # Modalidade mapping
    modalidade_orig = get_val(content, 'modalidade')
    if 'obrigado' in modalidade_orig:
        mod = 'obrigacao'
        lista_chave = 'obrigacoes'
    elif 'proibido' in modalidade_orig:
        mod = 'proibicao'
        lista_chave = 'proibicoes'
    elif 'permitido' in modalidade_orig:
        mod = 'permissao'
        lista_chave = 'permissoes'
    else:
        mod = 'obrigacao'
        lista_chave = 'obrigacoes'

    # Condition
    regra_sbvr = get_val(content, 'regra_sbvr')
    keywords = ['quando', 'desde que', 'exceto', 'salvo', 'observado']
    has_condition = any(kw in regra_sbvr.lower() for kw in keywords)
    
    if has_condition:
        cond_str = """      condition:
        existe: true
        regras:
          - tipo: condicao_normativa
            descricao: "Aplicar condicoes expressas na regra e na fonte normativa.\""""
    else:
        cond_str = """      condition:
        existe: false
        regras: []"""

    sbvr_block = f"""sbvr:
  scd:
    scope:
      atores:
        - instituicao_autorizada_bcb
      contexto:
        - {contexto}
      papeis:
        - sujeito_regulado
{cond_str}
    demand:
      modalidade: {mod}
      {lista_chave}:
        - cumprimento_da_regra"""

    # Remove existing sbvr block and any stray scd leftovers
    content = re.sub(r'^sbvr:.*?(?=\n\S|$)', '', content, flags=re.MULTILINE | re.DOTALL)
    content = re.sub(r'^\s*scd:.*?(?=\n\S|$)', '', content, flags=re.MULTILINE | re.DOTALL)
    
    # Insert after regra_sbvr
    if 'regra_sbvr:' in content:
        content = re.sub(r'(^regra_sbvr:.*?\n)', rf'\1{sbvr_block}\n', content, flags=re.MULTILINE)
    else:
        content = re.sub(r'(^modalidade:.*?\n)', rf'\1{sbvr_block}\n', content, flags=re.MULTILINE)

    # Clean up empty lines
    content = re.sub(r'\n\s*\n\s*\n', '\n\n', content)

    with open(file_path, 'w', encoding='utf-8') as f:
        f.write(content)

paths = [
    '/home/cleilsonpereira/compliance/bcb-rc-16-28-11-2025/sbvr/*.yaml',
    '/home/cleilsonpereira/compliance/bcb-rc-17-28-11-2025/sbvr/*.yaml'
]

results = {}
for p in paths:
    files = glob.glob(p)
    folder = os.path.dirname(p)
    results[folder] = {'total': len(files), 'processed': 0}
    for f in files:
        process_file(f)
        results[folder]['processed'] += 1

print(results)
