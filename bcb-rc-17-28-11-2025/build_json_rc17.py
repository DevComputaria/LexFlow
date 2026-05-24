import json
import re
from pathlib import Path

base = Path(__file__).parent
src = base / 'bcb-rc-17-28-11-2025' / 'resolucao-completa.md'
out = base / 'bcb-rc-17-28-11-2025' / 'rc17-estrutura-detalhada.json'
text = src.read_text(encoding='utf-8')
lines = [ln.rstrip() for ln in text.splitlines()]

chapter_re = re.compile(r'^CAP[IÍ]TULO\s+([IVXLCDM]+)$', re.IGNORECASE)
article_re = re.compile(r'^Art\.\s*(\d+)(?:º|\.)?\s*(.*)$')
par_unique_re = re.compile(r'^Par[aá]grafo\s+[uú]nico\.\s*(.*)$', re.IGNORECASE)
par_num_re = re.compile(r'^§\s*(\d+)[ºo]?\s*(.*)$')
inciso_re = re.compile(r'^([IVXLCDM]+)\s*-\s*(.*)$')
alinea_re = re.compile(r'^([a-z])\)\s*(.*)$')
item_re = re.compile(r'^(\d+)\.\s*(.*)$')


def clean(xs):
    return [x.strip() for x in xs if x.strip()]


def parse_nested_incisos(lines_block):
    incisos = []
    current_inc = None
    current_al = None

    for raw in lines_block:
        line = raw.strip()
        if not line:
            continue

        m_inc = inciso_re.match(line)
        m_al = alinea_re.match(line)
        m_it = item_re.match(line)

        if m_inc:
            current_inc = {
                'id': m_inc.group(1),
                'texto': m_inc.group(2).strip(),
                'alineas': []
            }
            incisos.append(current_inc)
            current_al = None
            continue

        if m_al and current_inc is not None:
            current_al = {
                'id': m_al.group(1),
                'texto': m_al.group(2).strip(),
                'itens': []
            }
            current_inc['alineas'].append(current_al)
            continue

        if m_it and current_al is not None:
            current_al['itens'].append({
                'id': m_it.group(1),
                'texto': m_it.group(2).strip()
            })
            continue

        # Continuacao de linha
        if current_al is not None:
            if current_al['itens']:
                current_al['itens'][-1]['texto'] += ' ' + line
            else:
                current_al['texto'] += ' ' + line
        elif current_inc is not None:
            current_inc['texto'] += ' ' + line

    # Remove listas vazias para JSON mais limpo
    for inc in incisos:
        if not inc['alineas']:
            del inc['alineas']
        else:
            for al in inc['alineas']:
                if not al['itens']:
                    del al['itens']

    return incisos


def parse_article_body(body_lines):
    body = clean(body_lines)
    if not body:
        return {
            'caput': '',
            'incisos': [],
            'paragrafos': []
        }

    # Identifica parágrafos
    par_idx = []
    for i, ln in enumerate(body):
        if par_unique_re.match(ln) or par_num_re.match(ln):
            par_idx.append(i)

    pre_par_lines = body[:par_idx[0]] if par_idx else body

    # Caput até primeiro inciso
    first_inc = next((i for i, ln in enumerate(pre_par_lines) if inciso_re.match(ln)), None)
    if first_inc is None:
        caput = ' '.join(pre_par_lines).strip()
        top_inc_lines = []
    else:
        caput = ' '.join(pre_par_lines[:first_inc]).strip()
        top_inc_lines = pre_par_lines[first_inc:]

    top_incisos = parse_nested_incisos(top_inc_lines)

    paragrafos = []
    if par_idx:
        limits = par_idx + [len(body)]
        for a, b in zip(limits[:-1], limits[1:]):
            chunk = body[a:b]
            head = chunk[0]
            rest = chunk[1:]

            m_uni = par_unique_re.match(head)
            m_num = par_num_re.match(head)
            if m_uni:
                pid = 'unico'
                intro = m_uni.group(1).strip()
            else:
                pid = m_num.group(1)
                intro = m_num.group(2).strip()

            # Texto do paragrafo antes de incisos
            first_inc_par = next((i for i, ln in enumerate(rest) if inciso_re.match(ln)), None)
            if first_inc_par is None:
                p_text = ' '.join([intro] + rest).strip()
                p_inc_lines = []
            else:
                p_text = ' '.join([intro] + rest[:first_inc_par]).strip()
                p_inc_lines = rest[first_inc_par:]

            p_obj = {
                'id': pid,
                'texto': p_text,
                'incisos': parse_nested_incisos(p_inc_lines)
            }
            if not p_obj['incisos']:
                del p_obj['incisos']
            paragrafos.append(p_obj)

    return {
        'caput': caput,
        'incisos': top_incisos,
        'paragrafos': paragrafos
    }

# Parse capítulos e artigos
chapters = []
current_chapter = None
current_article = None
article_lines = []

preamble = []
seen_first_chapter = False

for ln in lines:
    ch = chapter_re.match(ln.strip())
    ar = article_re.match(ln.strip())

    if ch:
        seen_first_chapter = True
        if current_article is not None:
            current_article['estrutura'] = parse_article_body(article_lines)
            current_chapter['artigos'].append(current_article)
            current_article = None
            article_lines = []
        current_chapter = {
            'id': ch.group(1),
            'titulo': '',
            'artigos': []
        }
        chapters.append(current_chapter)
        continue

    if current_chapter is not None and not current_chapter['titulo'] and ln.strip():
        if not article_re.match(ln.strip()):
            current_chapter['titulo'] = ln.strip()
            continue

    if ar and current_chapter is not None:
        if current_article is not None:
            current_article['estrutura'] = parse_article_body(article_lines)
            current_chapter['artigos'].append(current_article)
        current_article = {
            'id': int(ar.group(1)),
            'rotulo': f"Art. {ar.group(1)}",
            'cabecalho_complemento': ar.group(2).strip()
        }
        article_lines = []
        if ar.group(2).strip():
            article_lines.append(ar.group(2).strip())
        continue

    if current_article is not None:
        article_lines.append(ln)
    elif not seen_first_chapter:
        if ln.strip():
            preamble.append(ln.strip())

# Flush final
if current_article is not None and current_chapter is not None:
    current_article['estrutura'] = parse_article_body(article_lines)
    current_chapter['artigos'].append(current_article)

# Metadados finais (assinatura/publicacao)
signatarios = []
publicacao = {}
for i, ln in enumerate(lines):
    if ln.strip().isupper() and 'GABRIEL MURICCA' in ln.upper():
        cargo = lines[i+1].strip() if i+1 < len(lines) else ''
        signatarios.append({'nome': ln.strip(), 'cargo': cargo})
    if ln.strip().startswith('Publicada no DOU de '):
        publicacao['dou'] = ln.strip().replace('Publicada no DOU de ', '')

obj = {
    'norma': {
        'tipo': 'Resolucao Conjunta',
        'numero': 17,
        'data': '2025-11-28',
        'ementa': 'Disciplina a nomenclatura e a forma de apresentacao ao publico das instituicoes autorizadas a funcionar pelo Banco Central do Brasil.'
    },
    'preambulo': preamble,
    'estrutura': {
        'capitulos': chapters
    },
    'assinaturas': signatarios,
    'publicacao': publicacao
}

out.write_text(json.dumps(obj, ensure_ascii=False, indent=2), encoding='utf-8')
print(f'arquivo_json={out}')
print(f'capitulos={len(chapters)}')
print(f'artigos_total={sum(len(c["artigos"]) for c in chapters)}')
