"use client";
import { useEffect, useState } from "react";
import styles from "./usuarios.module.css";
import api from "../../services/api";

type User = {
  id: number;
  nome: string;
  data_resposta: string;
  cpf: string;
  data_nascimento: string;
  nacionalidade: string;
  estado_civil: string;
  nome_pai: string;
  nome_mae: string;
  endereco: string;
  telefone: string;
  interesses: string;
  compras_eventos: string;
  redes_sociais: { nome: string; url: string }[];
  perfis_esports: { nome: string; url: string }[];
};

export default function UsuariosPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [msg, setMsg] = useState<string | null>(null);
  const [expanded, setExpanded] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      window.location.href = "/login";
      return;
    }
    api
      .get("/admin/users", {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => setUsers(res.data))
      .catch((err) => {
        setMsg("Não autorizado ou erro ao buscar usuários.");
        if (err?.response?.status === 401) {
          window.location.href = "/login";
        }
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className={styles.container}>
        <p>Carregando...</p>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <h1 className={styles.titulo}>Respostas das Pesquisas</h1>
      {msg && <p>{msg}</p>}
      <div className={styles["user-list"]}>
        {users.map((user, idx) => (
          <div
            key={user.id}
            className={`${styles["user-card"]} ${
              expanded === idx ? styles.expanded : ""
            }`}
            onClick={() => setExpanded(expanded === idx ? null : idx)}
            style={{ cursor: "pointer" }}
          >
            <div className={styles["user-header"]}>
              <span className={styles["user-name"]}>{user.nome}</span>
              <span className={styles["user-date"]}>
                Respondido em: {user.data_resposta}
              </span>
            </div>
            {expanded === idx && (
              <div className={styles["user-info"]}>
                <div>
                  <strong>CPF:</strong> {user.cpf}
                </div>
                <div>
                  <strong>Data de Nascimento:</strong> {user.data_nascimento}
                </div>
                <div>
                  <strong>Nacionalidade:</strong> {user.nacionalidade}
                </div>
                <div>
                  <strong>Estado Civil:</strong> {user.estado_civil}
                </div>
                <div>
                  <strong>Nome do Pai:</strong> {user.nome_pai}
                </div>
                <div>
                  <strong>Nome da Mãe:</strong> {user.nome_mae}
                </div>
                <div>
                  <strong>Endereço:</strong> {user.endereco}
                </div>
                <div>
                  <strong>Telefone:</strong> {user.telefone}
                </div>
                <div>
                  <strong>Interesses:</strong> {user.interesses}
                </div>
                <div>
                  <strong>Compras e eventos no último ano:</strong> {user.compras_eventos}
                </div>
                <div>
                  <strong>Redes Sociais:</strong>{" "}
                  {user.redes_sociais.map((r, i) => (
                    <a
                      key={i}
                      href={r.url}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      {r.nome}
                      {i < user.redes_sociais.length - 1 ? ", " : ""}
                    </a>
                  ))}
                </div>
                <div>
                  <strong>Perfis em sites de esports:</strong>{" "}
                  {user.perfis_esports.map((p, i) => (
                    <a
                      key={i}
                      href={p.url}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      {p.nome}
                      {i < user.perfis_esports.length - 1 ? ", " : ""}
                    </a>
                  ))}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}