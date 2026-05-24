import json
import re
from pathlib import Path

src = Path('/home/cleilsonpereira/compliance/bcb-rc-16-28-11-2025.md')
out = Path('/home/cleilsonpereira/compliance/bcb-rc-16-28-11-2025/rc16-estrutura-detalhada.json')

lines = [ln.rstrip() for ln in src.read_text(encoding='utf-8').splitlines()]

chapter_re = re.compile(r'^CAP[IÍ]TULO\s+([IVXLCDM]+)$', re.IGNORECASE)
article_re = re.compile(r'^Art\.\s*(\d+)(?:º|\.)?\s*(.*)$')
par_unique_re = re.compile(r'^Par[aá]grafo\s+[uú]nico\.\s*(.*)$', re.IGNORECASE)
par_num_re = re.compile(r'^§\s*(\d+)[ºo]?\s*(.*)$')
inciso_re = re.compile(r'^([IVXLCDM]+)\s*-\s*(.*)$')
alinea_re = re.compile(r'^([a-z])\)\s*(.*)$')
item_re = re.compile(r'^(\d+)\.\s*(.*)$')


def nonempty(seq):
    return [x.strip() for x in seq if x.strip()]


def parse_hierarchy(block_lines):
    incisos = []
    current_inc = None
    current_al = None

    for raw in nonempty(block_lines):
        mi = inciso_re.match(raw)
        ma = alinea_re.match(raw)
        mt = item_re.match(raw)

        if mi:
            current_inc = {"id": mi.group(1), "texto": mi.group(2).strip(), "alineas": []}
            incisos.append(current_inc)
            current_al = None
            continue

        if ma and current_inc is not None:
            current_al = {"id": ma.group(1), "texto": ma.group(2).strip(), "itens": []}
            current_inc["alineas"].append(current_al)
            continue

        if mt and current_al is not None:
            current_al["itens"].append({"id": mt.group(1), "texto": mt.group(2).strip()})
            continue

        # continuation text
        if current_al is not None:
            if current_al["itens"]:
                current_al["itens"][-1]["texto"] += " " + raw
            else:
                current_al["texto"] += " " + raw
        elif current_inc is not None:
            current_inc["texto"] += " " + raw

    for inc in incisos:
        if not inc["alineas"]:
            del inc["alineas"]
        else:
            for al in inc["alineas"]:
                if not al["itens"]:
                    del al["itens"]

    return incisos


def parse_article_body(body_lines):
    body = nonempty(body_lines)
    if not body:
        return {"caput": ""}

    par_indexes = []
    for i, ln in enumerate(body):
        if par_unique_re.match(ln) or par_num_re.match(ln):
            par_indexes.append(i)

    article_head = body[:par_indexes[0]] if par_indexes else body

    first_inc = next((i for i, ln in enumerate(article_head) if inciso_re.match(ln)), None)
    if first_inc is None:
        caput = " ".join(article_head).strip()
        incisos = []
    else:
        caput = " ".join(article_head[:first_inc]).strip()
        incisos = parse_hierarchy(article_head[first_inc:])

    result = {"caput": caput}
    if incisos:
        result["incisos"] = incisos

    if par_indexes:
        paragrafos = []
        boundaries = par_indexes + [len(body)]
        for a, b in zip(boundaries[:-1], boundaries[1:]):
            chunk = body[a:b]
            head = chunk[0]
            rest = chunk[1:]

            mu = par_unique_re.match(head)
            mn = par_num_re.match(head)
            if mu:
                pid = "unico"
                intro = mu.group(1).strip()
            else:
                pid = mn.group(1)
                intro = mn.group(2).strip()

            p_first_inc = next((i for i, ln in enumerate(rest) if inciso_re.match(ln)), None)
            if p_first_inc is None:
                p_text = " ".join([intro] + rest).strip()
                p_incisos = []
            else:
                p_text = " ".join([intro] + rest[:p_first_inc]).strip()
                p_incisos = parse_hierarchy(rest[p_first_inc:])

            pobj = {"id": pid, "texto": p_text}
            if p_incisos:
                pobj["incisos"] = p_incisos
            paragrafos.append(pobj)

        result["paragrafos"] = paragrafos

    return result


capitulos = []
preambulo = []
current_chapter = None
current_article = None
current_article_lines = []
started_body = False

for ln in lines:
    s = ln.strip()

    m_ch = chapter_re.match(s)
    m_ar = article_re.match(s)

    if m_ch:
        started_body = True
        if current_article is not None:
            current_article.update(parse_article_body(current_article_lines))
            current_chapter["artigos"].append(current_article)
            current_article = None
            current_article_lines = []

        current_chapter = {"id": m_ch.group(1), "titulo": "", "artigos": []}
        capitulos.append(current_chapter)
        continue

    if current_chapter is not None and current_chapter["titulo"] == "" and s and not article_re.match(s):
        current_chapter["titulo"] = s
        continue

    if m_ar and current_chapter is not None:
        if current_article is not None:
            current_article.update(parse_article_body(current_article_lines))
            current_chapter["artigos"].append(current_article)

        current_article = {
            "id": int(m_ar.group(1)),
            "rotulo": f"Art. {m_ar.group(1)}"
        }
        current_article_lines = []
        if m_ar.group(2).strip():
            current_article_lines.append(m_ar.group(2).strip())
        continue

    if current_article is not None:
        current_article_lines.append(ln)
    elif not started_body and s:
        preambulo.append(s)

if current_article is not None and current_chapter is not None:
    current_article.update(parse_article_body(current_article_lines))
    current_chapter["artigos"].append(current_article)

assinaturas = []
publicacao = {}
for i, ln in enumerate(lines):
    s = ln.strip()
    if "GABRIEL MURICCA GAL" in s.upper():
        cargo = lines[i + 1].strip() if i + 1 < len(lines) else ""
        assinaturas.append({"nome": s, "cargo": cargo})
    if s.startswith("Publicada no DOU de "):
        publicacao["dou"] = s.replace("Publicada no DOU de ", "")

obj = {
    "norma": {
        "tipo": "Resolucao Conjunta",
        "numero": 16,
        "data": "2025-11-28",
        "ementa": "Dispoe sobre a prestacao de servicos de Banking as a Service - BaaS por parte das instituicoes financeiras, instituicoes de pagamento e demais instituicoes autorizadas a funcionar pelo Banco Central do Brasil.",
        "publicacao_dou": "2025-12-01",
        "entrada_vigor": "2025-12-01"
    },
    "estrutura": {
        "capitulos": capitulos
    },
    "assinaturas": assinaturas,
    "publicacao": publicacao,
    "observacao": "Os textos nao substituem a publicacao no DOU e no Sisbacen."
}

out.write_text(json.dumps(obj, ensure_ascii=False, indent=2), encoding='utf-8')
print(f'capitulos={len(capitulos)}')
print(f'artigos={sum(len(c["artigos"]) for c in capitulos)}')
print(f'arquivo={out}')
