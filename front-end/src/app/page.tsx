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
  redes_sociais: string;
  perfis_esports: string;
};

const API_URL = "http://localhost:8000/usuario"; // ajuste se necessário

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
    redes_sociais: "",
    perfis_esports: "",
  });
  const [statusMsg, setStatusMsg] = useState<string | null>(null);
  const [validando, setValidando] = useState(false);
  const [docMsg, setDocMsg] = useState<string | null>(null); // Mensagem local do documento

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0] || null;
    setForm((prev) => ({ ...prev, documento: file, docValidado: null }));
    setDocMsg(null); // Limpa mensagem ao trocar arquivo
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
        // Se houver arquivo, envia como multipart/form-data
        const data = new FormData();
        Object.entries(form).forEach(([key, value]) => {
          if (key === "documento" && value) {
            data.append("documento", value as File);
          } else if (typeof value === "string") {
            data.append(key, value);
          }
        });
        response = await fetch(API_URL, {
          method: "POST",
          body: data,
        });
      } else {
        // Se não houver arquivo, envia como JSON
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
          redes_sociais: "",
          perfis_esports: "",
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
                  <input className={styles.input} name="cpf" value={form.cpf} onChange={handleChange} required />
                </div>
              </div>
              <div className={styles.inputRow}>
                <div className={styles.inputCol}>
                  <label className={styles.label}>Data de nascimento</label>
                  <input className={styles.input} name="nascimento" type="date" value={form.nascimento} onChange={handleChange} required />
                </div>
                <div className={styles.inputCol}>
                  <label className={styles.label}>Nacionalidade</label>
                  <input className={styles.input} name="nacionalidade" value={form.nacionalidade} onChange={handleChange} required />
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
              <label className={styles.label}>Envie seu documento (imagem ou PDF)</label>
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
              {/* Mensagem de status da validação do documento */}
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
                  <input className={styles.input} name="redes_sociais" value={form.redes_sociais} onChange={handleChange} placeholder="Separe por vírgula" />
                </div>
                <div className={styles.inputCol}>
                  <label className={styles.label}>Links de perfis em sites de esports</label>
                  <input className={styles.input} name="perfis_esports" value={form.perfis_esports} onChange={handleChange} placeholder="Separe por vírgula" />
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