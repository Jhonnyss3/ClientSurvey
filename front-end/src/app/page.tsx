"use client";
import { useState } from "react";
import styles from "./cadastro.module.css";
import Link from "next/link";

type FormData = {
  nome: string;
  cpf: string;
  nascimento: string;
  nacionalidade: string;
  estado_civil: string;
  nome_pai: string;
  nome_mae: string;
  documento?: File | null;
  docValidado?: boolean | null;
  endereco: string;
  telefone: string;
  interesses: string;
  compras_eventos: string;
  redes_sociais: string[];
  perfis_esports: string[];
};

const API_URL = "http://localhost:8000/usuario"; // ajuste se necessário

// Função para formatar CPF enquanto digita
function formatCPF(value: string) {
  value = value.replace(/\D/g, "");
  if (value.length > 9)
    return value.replace(/(\d{3})(\d{3})(\d{3})(\d{1,2})/, "$1.$2.$3-$4");
  if (value.length > 6)
    return value.replace(/(\d{3})(\d{3})(\d{1,3})/, "$1.$2.$3");
  if (value.length > 3)
    return value.replace(/(\d{3})(\d{1,3})/, "$1.$2");
  return value;
}

export default function CadastroPage() {
  const [step, setStep] = useState(1);
  const [form, setForm] = useState<FormData>({
    nome: "",
    cpf: "",
    nascimento: "",
    nacionalidade: "",
    estado_civil: "",
    nome_pai: "",
    nome_mae: "",
    documento: null,
    docValidado: null,
    endereco: "",
    telefone: "",
    interesses: "",
    compras_eventos: "",
    redes_sociais: [""],
    perfis_esports: [""],
  });
  const [statusMsg, setStatusMsg] = useState<string | null>(null);
  const [validando, setValidando] = useState(false);
  const [docMsg, setDocMsg] = useState<string | null>(null);

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0] || null;
    setForm((prev) => ({ ...prev, documento: file, docValidado: null }));
    setDocMsg(null);
  }

  // Dinâmico para redes sociais
  function handleRedeSocialChange(idx: number, value: string) {
    setForm((prev) => {
      const redes = [...prev.redes_sociais];
      redes[idx] = value;
      return { ...prev, redes_sociais: redes };
    });
  }
  function handleAddRedeSocial() {
    setForm((prev) => ({
      ...prev,
      redes_sociais: [...prev.redes_sociais, ""],
    }));
  }
  function handleRemoveRedeSocial(idx: number) {
    setForm((prev) => {
      const redes = [...prev.redes_sociais];
      redes.splice(idx, 1);
      return { ...prev, redes_sociais: redes.length ? redes : [""] };
    });
  }

  // Dinâmico para perfis de esports
  function handlePerfilEsportChange(idx: number, value: string) {
    setForm((prev) => {
      const perfis = [...prev.perfis_esports];
      perfis[idx] = value;
      return { ...prev, perfis_esports: perfis };
    });
  }
  function handleAddPerfilEsport() {
    setForm((prev) => ({
      ...prev,
      perfis_esports: [...prev.perfis_esports, ""],
    }));
  }
  function handleRemovePerfilEsport(idx: number) {
    setForm((prev) => {
      const perfis = [...prev.perfis_esports];
      perfis.splice(idx, 1);
      return { ...prev, perfis_esports: perfis.length ? perfis : [""] };
    });
  }

  async function handleValidarDocumento() {
    setValidando(true);
    setDocMsg("Validando documento...");
    setForm((prev) => ({ ...prev, docValidado: null }));
    await new Promise((res) => setTimeout(res, 1500));
    const sucesso = Math.random() > 0.3;
    setForm((prev) => ({ ...prev, docValidado: sucesso }));
    setDocMsg(
      sucesso
        ? "Documento validado com sucesso!"
        : "Falha na validação. Tente novamente."
    );
    setValidando(false);
  }

  function handleNext() {
    setStatusMsg(null);
    setStep((s) => s + 1);
  }
  function handleBack() {
    setStatusMsg(null);
    setStep((s) => s - 1);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatusMsg("Enviando dados...");

    try {
      let response;
      if (form.documento) {
        const data = new FormData();
        Object.entries(form).forEach(([key, value]) => {
          if (key === "documento" && value) {
            data.append("documento", value as File);
          } else if (key === "redes_sociais") {
            (value as string[]).forEach((v) => data.append("redes_sociais", v));
          } else if (key === "perfis_esports") {
            (value as string[]).forEach((v) => data.append("perfis_esports", v));
          } else if (typeof value === "string") {
            data.append(key, value);
          }
        });
        response = await fetch(API_URL, {
          method: "POST",
          body: data,
        });
      } else {
        response = await fetch(API_URL, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(form),
        });
      }

      if (response.ok) {
        setStatusMsg("Cadastro realizado com sucesso!");
        setStep(1);
        setForm({
          nome: "",
          cpf: "",
          nascimento: "",
          nacionalidade: "",
          estado_civil: "",
          nome_pai: "",
          nome_mae: "",
          documento: null,
          docValidado: null,
          endereco: "",
          telefone: "",
          interesses: "",
          compras_eventos: "",
          redes_sociais: [""],
          perfis_esports: [""],
        });
      } else {
        const error = await response.json();
        setStatusMsg(error.detail || "Erro ao cadastrar usuário.");
      }
    } catch (err) {
      setStatusMsg("Erro ao conectar com o servidor.");
    }
  }

  return (
    <div className={styles.wrapper}>
      <div className={styles.header}>
        <Link href="/login" className={styles.loginLink}>LOGIN</Link>
      </div>
      <form className={styles.formContainer} onSubmit={handleSubmit}>
        {step === 1 && (
          <>
            <h2 className={styles.tituloFase}>Informações Pessoais</h2>
            <div className={styles.inputGroup}>
              <div className={styles.inputRow}>
                <div className={styles.inputCol}>
                  <label className={styles.label}>Nome completo</label>
                  <input className={styles.input} name="nome" value={form.nome} onChange={handleChange} required />
                </div>
                <div className={styles.inputCol}>
                  <label className={styles.label}>CPF</label>
                  <input
                    className={styles.input}
                    name="cpf"
                    value={form.cpf}
                    onChange={e =>
                      setForm(prev => ({
                        ...prev,
                        cpf: formatCPF(e.target.value)
                      }))
                    }
                    maxLength={14}
                    required
                  />
                </div>
              </div>
              <div className={styles.inputRow}>
                <div className={styles.inputCol}>
                  <label className={styles.label}>Data de nascimento</label>
                  <input className={styles.input} name="nascimento" type="date" value={form.nascimento} onChange={handleChange} required />
                </div>
                <div className={styles.inputCol}>
                  <label className={styles.nacionalidadeLabel}>
                    Nacionalidade
                    <span className={styles.tooltip} tabIndex={0}>
                      <span className={styles.tooltipIcon}>?</span>
                      <span className={styles.tooltipText}>
                        Nacionalidade igual presente no documento de identidade, ex: BRA
                      </span>
                    </span>
                  </label>
                  <input
                    className={styles.input}
                    name="nacionalidade"
                    value={form.nacionalidade}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className={styles.inputCol}>
                  <label className={styles.label}>Estado civil</label>
                  <select className={styles.input} name="estado_civil" value={form.estado_civil} onChange={handleChange} required>
                    <option value="">Selecione</option>
                    <option value="solteiro">Solteiro(a)</option>
                    <option value="casado">Casado(a)</option>
                    <option value="divorciado">Divorciado(a)</option>
                    <option value="viuvo">Viúvo(a)</option>
                  </select>
                </div>
              </div>
              <div className={styles.inputRow}>
                <div className={styles.inputCol}>
                  <label className={styles.label}>Nome do pai</label>
                  <input className={styles.input} name="nome_pai" value={form.nome_pai} onChange={handleChange} required />
                </div>
                <div className={styles.inputCol}>
                  <label className={styles.label}>Nome da mãe</label>
                  <input className={styles.input} name="nome_mae" value={form.nome_mae} onChange={handleChange} required />
                </div>
              </div>
            </div>
            <div className={styles.buttonRow}>
              <button type="button" className={styles.button} onClick={handleNext}>Avançar</button>
            </div>
            {statusMsg && <div className={styles.statusMsg}>{statusMsg}</div>}
          </>
        )}

        {step === 2 && (
          <>
            <h2 className={styles.tituloFase}>Documento</h2>
            <div className={styles.inputGroup}>
              <label className={styles.label}>Envie sua identidade (imagem ou PDF)</label>
              <input
                className={styles.input}
                type="file"
                accept="image/*,application/pdf"
                onChange={handleFileChange}
              />
              {form.documento && (
                <div>
                  <span>Arquivo selecionado: {form.documento.name}</span>
                </div>
              )}
              <button
                type="button"
                className={styles.button}
                onClick={handleValidarDocumento}
                disabled={!form.documento || validando}
                style={{ marginTop: 10 }}
              >
                Validar Documento
              </button>
              {docMsg && (
                <div
                  className={styles.statusMsg}
                  style={{
                    color:
                      docMsg === "Documento validado com sucesso!"
                        ? "green"
                        : docMsg === "Validando documento..."
                        ? "#cca500"
                        : "red",
                  }}
                >
                  {docMsg}
                </div>
              )}
            </div>
            <div className={styles.buttonRow}>
              <button type="button" className={styles.button} onClick={handleBack}>Voltar</button>
              <button
                type="button"
                className={styles.button}
                onClick={handleNext}
                disabled={form.docValidado !== true}
              >
                Avançar
              </button>
            </div>
          </>
        )}

        {step === 3 && (
          <>
            <h2 className={styles.tituloFase}>Endereço e Contato</h2>
            <div className={styles.inputGroup}>
              <div className={styles.inputRow}>
                <div className={styles.inputCol}>
                  <label className={styles.label}>Endereço</label>
                  <input className={styles.input} name="endereco" value={form.endereco} onChange={handleChange} required />
                </div>
                <div className={styles.inputCol}>
                  <label className={styles.label}>Telefone</label>
                  <input className={styles.input} name="telefone" value={form.telefone} onChange={handleChange} required />
                </div>
              </div>
            </div>
            <div className={styles.buttonRow}>
              <button type="button" className={styles.button} onClick={handleBack}>Voltar</button>
              <button type="button" className={styles.button} onClick={handleNext}>Avançar</button>
            </div>
            {statusMsg && <div className={styles.statusMsg}>{statusMsg}</div>}
          </>
        )}

        {step === 4 && (
          <>
            <h2 className={styles.tituloFase}>Interesses e Redes</h2>
            <div className={styles.inputGroup}>
              <div className={styles.inputRow}>
                <div className={styles.inputCol}>
                  <label className={styles.label}>Interesses</label>
                  <input className={styles.input} name="interesses" value={form.interesses} onChange={handleChange} placeholder="Ex: FPS, MOBA, RPG" />
                </div>
                <div className={styles.inputCol}>
                  <label className={styles.label}>Compras e eventos no último ano</label>
                  <input className={styles.input} name="compras_eventos" value={form.compras_eventos} onChange={handleChange} />
                </div>
              </div>
              <div className={styles.inputRow}>
                <div className={styles.inputCol}>
                  <label className={styles.label}>Links das redes sociais</label>
                  {form.redes_sociais.map((rede, idx) => (
                    <div key={idx} className={styles.redeSocialRow}>
                      <input
                        className={styles.input}
                        name={`redes_sociais_${idx}`}
                        value={rede}
                        onChange={e => handleRedeSocialChange(idx, e.target.value)}
                        placeholder="URL da rede social"
                      />
                      <button
                        type="button"
                        className={styles.addRemoveBtn}
                        onClick={handleAddRedeSocial}
                        style={{ marginLeft: 6 }}
                        title="Adicionar campo"
                        disabled={form.redes_sociais.length >= 5 || !rede}
                      >
                        +
                      </button>
                      {form.redes_sociais.length > 1 && (
                        <button
                          type="button"
                          className={styles.addRemoveBtn}
                          onClick={() => handleRemoveRedeSocial(idx)}
                          title="Remover campo"
                        >
                          -
                        </button>
                      )}
                    </div>
                  ))}
                </div>
                <div className={styles.inputCol}>
                  <label className={styles.label}>Links de perfis em sites de esports</label>
                  {form.perfis_esports.map((perfil, idx) => (
                    <div key={idx} className={styles.redeSocialRow}>
                      <input
                        className={styles.input}
                        name={`perfis_esports_${idx}`}
                        value={perfil}
                        onChange={e => handlePerfilEsportChange(idx, e.target.value)}
                        placeholder="URL do perfil de esports"
                      />
                      <button
                        type="button"
                        className={styles.addRemoveBtn}
                        onClick={handleAddPerfilEsport}
                        style={{ marginLeft: 6 }}
                        title="Adicionar campo"
                        disabled={form.perfis_esports.length >= 5 || !perfil}
                      >
                        +
                      </button>
                      {form.perfis_esports.length > 1 && (
                        <button
                          type="button"
                          className={styles.addRemoveBtn}
                          onClick={() => handleRemovePerfilEsport(idx)}
                          title="Remover campo"
                        >
                          -
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <div className={styles.buttonRow}>
              <button type="button" className={styles.button} onClick={handleBack}>Voltar</button>
              <button type="submit" className={styles.button}>Finalizar Cadastro</button>
            </div>
            {statusMsg && <div className={styles.statusMsg}>{statusMsg}</div>}
          </>
        )}
      </form>
    </div>
  );
}