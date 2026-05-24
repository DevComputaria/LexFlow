from pathlib import Path
import re

base = Path('/home/cleilsonpereira/compliance/bcb-rc-16-28-11-2025')
md_path = base / 'sbvr-bcb-rc-16-28-11-2025.md'
out_dir = base / 'sbvr'
out_dir.mkdir(parents=True, exist_ok=True)
text = md_path.read_text(encoding='utf-8')
lines = text.splitlines()

# Parse rules
rules = []
cur = None
for line in lines:
    if line.startswith('#### bcb-rc-16-r'):
        if cur:
            rules.append(cur)
        cur = {'id': line.replace('####', '').strip(), 'modalidade': '', 'regra_sbvr': '', 'artigo': '', 'texto_original': ''}
        continue
    if not cur:
        continue
    if line.startswith('- modalidade:'):
        cur['modalidade'] = line.split(':', 1)[1].strip()
    elif line.startswith('- regra sbvr:'):
        cur['regra_sbvr'] = line.split(':', 1)[1].strip()
    elif line.startswith('- fonte:'):
        cur['artigo'] = line.split(':', 1)[1].strip()
    elif line.startswith('- texto original:'):
        v = line.split(':', 1)[1].strip()
        if v.startswith('"') and v.endswith('"') and len(v) >= 2:
            v = v[1:-1]
        cur['texto_original'] = v
if cur:
    rules.append(cur)

# Keep only valid parsed rules
rules = [r for r in rules if r['id'] and r['modalidade'] and r['regra_sbvr'] and r['artigo'] and r['texto_original']]

# Parse ambiguities section
amb_map = {}
for r in rules:
    amb_map[r['id']] = []

try:
    sec_start = next(i for i, ln in enumerate(lines) if ln.strip() == '## 6. Pontos com potencial ambiguidade')
except StopIteration:
    sec_start = -1

if sec_start != -1:
    i = sec_start + 1
    while i < len(lines):
        ln = lines[i].strip()
        if ln.startswith('### A-'):
            m = re.match(r'^###\s+(A-\d+)\s+-\s+(.+)$', ln)
            if not m:
                i += 1
                continue
            aid, title = m.group(1), m.group(2).strip()
            impacted = ''
            desc = ''
            j = i + 1
            while j < len(lines) and not lines[j].strip().startswith('### A-'):
                s = lines[j].strip()
                if s.startswith('- Regras impactadas:'):
                    impacted = s.split(':', 1)[1].strip().rstrip('.')
                if s.startswith('- Descricao:'):
                    desc = s.split(':', 1)[1].strip().rstrip('.')
                j += 1

            def extract_ids(spec: str):
                ids = []
                # ranges: bcb-rc-16-r08 a bcb-rc-16-r13
                for rm in re.finditer(r'(bcb-rc-16-r(\d{2}))\s+a\s+(bcb-rc-16-r(\d{2}))', spec):
                    s1 = int(rm.group(2)); s2 = int(rm.group(4))
                    lo, hi = sorted((s1, s2))
                    for n in range(lo, hi + 1):
                        ids.append(f'bcb-rc-16-r{n:02d}')
                # singles
                for sid in re.findall(r'bcb-rc-16-r\d{2}', spec):
                    ids.append(sid)
                # unique preserve order
                out = []
                seen = set()
                for x in ids:
                    if x not in seen:
                        seen.add(x)
                        out.append(x)
                return out

            for rid in extract_ids(impacted):
                if rid in amb_map:
                    amb_map[rid].append({'id': aid, 'titulo': title, 'descricao': desc})
            i = j
            continue
        i += 1

def yq(v):
    if v is None:
        return 'null'
    s = str(v)
    s = s.replace('"', '\\"')
    return f'"{s}"'

for r in rules:
    rid = r['id']
    txt_low = (r['regra_sbvr'] + ' ' + r['texto_original']).lower()
    has_time = any(k in txt_low for k in ['prazo', 'dias', 'dia', 'ano', 'anual', 'data de sua publicacao', 'ate 31', 'trinta dias', 'cinco anos', 'dez anos'])

    # Time defaults
    p_existe = 'true' if has_time else 'false'
    p_desc = 'Prazo ou periodicidade prevista na regra.' if has_time else None
    p_marco = None
    p_prazo = None
    p_limite = None

    if rid == 'bcb-rc-16-r76':
        p_existe = 'true'; p_desc = 'Adequacao de contratos vigentes na entrada em vigor.'; p_marco = '2025-12-01'; p_prazo = 'ate_2026-12-31'; p_limite = '2026-12-31'
    elif rid == 'bcb-rc-16-r81':
        p_existe = 'true'; p_desc = 'Vigencia imediata na data de publicacao.'; p_marco = '2025-12-01'; p_prazo = 'imediato'; p_limite = '2025-12-01'
    elif rid == 'bcb-rc-16-r68':
        p_existe = 'true'; p_desc = 'Periodicidade minima anual de testes.'; p_marco = 'entrada_em_vigor'; p_prazo = 'P1Y'; p_limite = None
    elif rid == 'bcb-rc-16-r75':
        p_existe = 'true'; p_desc = 'Guarda minima de 5 anos e 10 anos conforme tipo de documento.'; p_marco = 'evento_relevante'; p_prazo = 'P5Y_e_P10Y'; p_limite = None
    elif rid == 'bcb-rc-16-r47':
        p_existe = 'true'; p_desc = 'Notificacao previa minima de 30 dias com possivel extensao adicional de 30 dias.'; p_marco = 'intencao_interrupcao'; p_prazo = 'P30D_com_extensao_P30D'; p_limite = None

    conds = []
    if any(k in txt_low for k in ['desde que', 'salvo', 'exceto', 'quando', 'observado']):
        conds.append('Aplicar condicoes expressas no texto da regra e na fonte normativa.')

    keywords = ['sbvr', 'rc16', 'bcb', r['modalidade']]

    ambs = amb_map.get(rid, [])

    out = []
    out.append(f'id: {rid}')
    out.append('referencia_normativa:')
    out.append('  ato: Resolucao Conjunta')
    out.append('  numero: 16')
    out.append('  data: 2025-11-28')
    out.append('  publicacao_dou: 2025-12-01')
    out.append('  vigencia: 2025-12-01')
    out.append(f'artigo: {r["artigo"]}')
    out.append(f'modalidade: {r["modalidade"]}')
    out.append(f'regra_sbvr: {yq(r["regra_sbvr"])}')
    out.append(f'texto_original: {yq(r["texto_original"])}')
    out.append(f'keywords: [{", ".join(keywords)}]')
    out.append('vocabulario_conceitos:')
    out.append('  - termo: instituicao autorizada')
    out.append('    conceito: Instituicao autorizada a funcionar pelo BCB no contexto do BaaS.')
    out.append('  - termo: prestacao de servicos de BaaS')
    out.append('    conceito: Relacao contratual entre prestadora e tomadora para disponibilizacao de servicos ao cliente.')
    out.append('condicoes:')
    if conds:
        for c in conds:
            out.append(f'  - {c}')
    else:
        out.append('  []')
    out.append('periodo_tempo:')
    out.append(f'  existe: {p_existe}')
    out.append(f'  descricao: {"null" if p_desc is None else yq(p_desc)}')
    out.append(f'  marco_inicial: {"null" if p_marco is None else p_marco}')
    out.append(f'  prazo: {"null" if p_prazo is None else p_prazo}')
    out.append(f'  data_limite: {"null" if p_limite is None else p_limite}')
    out.append('ambiguidades_relacionadas:')
    if ambs:
        for a in ambs:
            out.append(f'  - id: {a["id"]}')
            out.append(f'    titulo: {yq(a["titulo"])}')
            out.append(f'    descricao: {yq(a["descricao"])}')
    else:
        out.append('  []')

    (out_dir / f'{rid}.yaml').write_text('\n'.join(out) + '\n', encoding='utf-8')

print(f'parsed_rules={len(rules)}')
print(f'generated_files={len(list(out_dir.glob("bcb-rc-16-r*.yaml")))}')
