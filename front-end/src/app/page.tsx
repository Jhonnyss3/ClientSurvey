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

  // Handlers
  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0] || null;
    setForm((prev) => ({ ...prev, documento: file, docValidado: null }));
  }

  // Simulação de validação de documento
  async function handleValidarDocumento() {
    setValidando(true);
    setStatusMsg("Validando documento...");
    // Simule uma chamada à API de validação
    await new Promise((res) => setTimeout(res, 1500));
    // Simule sucesso ou erro
    const sucesso = Math.random() > 0.3;
    setForm((prev) => ({ ...prev, docValidado: sucesso }));
    setStatusMsg(sucesso ? "Documento validado com sucesso!" : "Falha na validação. Tente novamente.");
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

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatusMsg("Enviando dados...");
    // Aqui você pode enviar para a API
    setTimeout(() => setStatusMsg("Cadastro realizado com sucesso!"), 1200);
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
            <label className={styles.label}>Nome completo</label>
            <input className={styles.input} name="nome" value={form.nome} onChange={handleChange} required />
              <label>CPF</label>
              <input name="cpf" value={form.cpf} onChange={handleChange} required />
              <label>Data de nascimento</label>
              <input name="nascimento" type="date" value={form.nascimento} onChange={handleChange} required />
              <label>Nacionalidade</label>
              <input name="nacionalidade" value={form.nacionalidade} onChange={handleChange} required />
              <label>Estado civil</label>
              <select name="estado_civil" value={form.estado_civil} onChange={handleChange} required>
                <option value="">Selecione</option>
                <option value="solteiro">Solteiro(a)</option>
                <option value="casado">Casado(a)</option>
                <option value="divorciado">Divorciado(a)</option>
                <option value="viuvo">Viúvo(a)</option>
              </select>
              <label>Nome do pai</label>
              <input name="nome_pai" value={form.nome_pai} onChange={handleChange} required />
              <label>Nome da mãe</label>
              <input name="nome_mae" value={form.nome_mae} onChange={handleChange} required />
            </div>
            <div className={styles.buttonRow}>
            <button type="button" className={styles.button} onClick={handleNext}>Avançar</button>
            </div>
          </>
        )}

        {step === 2 && (
          <>
            <h2>Documento</h2>
            <div className={styles.inputGroup}>
              <label>Envie seu documento (imagem ou PDF)</label>
              <input type="file" accept="image/*,application/pdf" onChange={handleFileChange} />
              {form.documento && (
                <div>
                  <span>Arquivo selecionado: {form.documento.name}</span>
                </div>
              )}
              <button
                type="button"
                onClick={handleValidarDocumento}
                disabled={!form.documento || validando}
                style={{ marginTop: 10 }}
              >
                Validar Documento
              </button>
              {form.docValidado === true && (
                <div className={styles.statusMsg} style={{ color: "green" }}>
                  Documento validado com sucesso!
                </div>
              )}
              {form.docValidado === false && (
                <div className={styles.statusMsg} style={{ color: "red" }}>
                  Falha na validação. Tente novamente.
                </div>
              )}
            </div>
            <div className={styles.buttonRow}>
              <button type="button" onClick={handleBack}>Voltar</button>
              <button
                type="button"
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
            <h2>Endereço e Contato</h2>
            <div className={styles.inputGroup}>
              <label>Endereço</label>
              <input name="endereco" value={form.endereco} onChange={handleChange} required />
              <label>Telefone</label>
              <input name="telefone" value={form.telefone} onChange={handleChange} required />
            </div>
            <div className={styles.buttonRow}>
              <button type="button" onClick={handleBack}>Voltar</button>
              <button type="button" onClick={handleNext}>Avançar</button>
            </div>
          </>
        )}

        {step === 4 && (
          <>
            <h2>Interesses e Redes</h2>
            <div className={styles.inputGroup}>
              <label>Interesses</label>
              <input name="interesses" value={form.interesses} onChange={handleChange} placeholder="Ex: FPS, MOBA, RPG" />
              <label>Compras e eventos no último ano</label>
              <input name="compras_eventos" value={form.compras_eventos} onChange={handleChange} />
              <label>Links das redes sociais</label>
              <input name="redes_sociais" value={form.redes_sociais} onChange={handleChange} placeholder="Separe por vírgula" />
              <label>Links de perfis em sites de esports</label>
              <input name="perfis_esports" value={form.perfis_esports} onChange={handleChange} placeholder="Separe por vírgula" />
            </div>
            <div className={styles.buttonRow}>
              <button type="button" onClick={handleBack}>Voltar</button>
              <button type="submit">Finalizar Cadastro</button>
            </div>
          </>
        )}

        {statusMsg && <div className={styles.statusMsg}>{statusMsg}</div>}
      </form>
    </div>
  );
}