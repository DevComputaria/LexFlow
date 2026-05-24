import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import React from "react";

import RuleCard from "@/components/rule-card";
import SearchBar from "@/components/search-bar";

describe("RuleCard", () => {
  const mockRegra = {
    id: "bcb-rc-16-r01",
    artigo: "Art. 1o",
    modalidade: "obrigado",
    regra_sbvr: "É obrigatório manter contrato formal.",
    documento_id: "bcb-rc-16",
  };

  it("renderiza id e artigo", () => {
    render(<RuleCard regra={mockRegra} onClick={() => {}} />);
    expect(screen.getByText("bcb-rc-16-r01")).toBeDefined();
    expect(screen.getByText("Art. 1o")).toBeDefined();
  });

  it("renderiza texto da regra", () => {
    render(<RuleCard regra={mockRegra} onClick={() => {}} />);
    expect(screen.getByText("É obrigatório manter contrato formal.")).toBeDefined();
  });

  it("chama onClick ao clicar", () => {
    let clicked = false;
    render(<RuleCard regra={mockRegra} onClick={() => { clicked = true; }} />);
    screen.getByRole("button").click();
    expect(clicked).toBe(true);
  });
});

describe("SearchBar", () => {
  it("renderiza input de busca", () => {
    render(<SearchBar valor="" onChange={() => {}} onSearch={() => {}} />);
    expect(screen.getByPlaceholderText("Buscar regras...")).toBeDefined();
  });

  it("exibe botao de limpar quando tem valor", () => {
    render(<SearchBar valor="teste" onChange={() => {}} onSearch={() => {}} />);
    const clearButton = screen.getByRole("button");
    expect(clearButton).toBeDefined();
  });

  it("nao exibe botao de limpar quando vazio", () => {
    const { container } = render(<SearchBar valor="" onChange={() => {}} onSearch={() => {}} />);
    const buttons = container.querySelectorAll("button");
    expect(buttons.length).toBe(0);
  });
});
