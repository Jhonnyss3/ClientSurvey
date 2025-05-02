import React, { useState, useEffect } from "react";
import api from "./services/api";

// Tipos
interface Usuario {
  nome: string;
  cpf: string;
  nascimento: string;
  nacionalidade: string;
  estado_civil: string;
  nome_pai: string;
  nome_mae: string;
  endereco: string;
  telefone: string;
  interesses: string[];
  compras_eventos: string;
  redes_sociais: string[];
  perfis_esports: string[];
  created_at: string;
}

type Page = "cadastro" | "login" | "admin";

function App() {
  const [page, setPage] = useState<Page>("cadastro");

  // --- ESTADO: Cadastro usuário ---
  const [form, setForm] = useState<any>({});
  const [documento, setDocumento] = useState<File | null>(null);
  const [cadastroMsg, setCadastroMsg] = useState<string | null>(null);

  // --- ESTADO: Login admin ---
  const [login, setLogin] = useState("");
  const [password, setPassword] = useState("");
  const [loginMsg, setLoginMsg] = useState<string | null>(null);
  const [token, setToken] = useState<string | null>(null);

  // --- ESTADO: Listagem usuários ---
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [usuariosMsg, setUsuariosMsg] = useState<string | null>(null);

  // --- HANDLERS ---
  // Cadastro usuário
  const handleCadastroChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleCadastroSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setCadastroMsg(null);

    if (!documento) {
      setCadastroMsg("Selecione um documento.");
      return;
    }

    const data = new FormData();
    Object.entries(form).forEach(([key, value]) => {
  // Se for array, transforma em string separada por vírgula
      if (Array.isArray(value)) {
        data.append(key, value.join(","));
      } else if (value !== undefined && value !== null) {
        data.append(key, String(value));
      }
    });
    data.append("documento", documento);

    try {
      const res = await api.post("/usuario", data, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setCadastroMsg("Usuário cadastrado com sucesso!");
      setForm({});
      setDocumento(null);
    } catch (err: any) {
      setCadastroMsg(err?.response?.data?.detail || "Erro ao cadastrar usuário.");
    }
  };

  // Login admin
  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginMsg(null);

    try {
      const res = await api.post("/admin/login", new URLSearchParams({
        username: login,
        password: password,
      }), {
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
      });
      setToken(res.data.access_token);
      setLoginMsg("Login realizado!");
      setPage("admin");
    } catch (err: any) {
      setLoginMsg(err?.response?.data?.detail || "Erro no login.");
    }
  };

  // Listar usuários (apenas se logado)
  useEffect(() => {
    if (page === "admin" && token) {
      api.get<Usuario[]>("/admin/users", {
        headers: { Authorization: `Bearer ${token}` },
      })
        .then(res => {
          setUsuarios(res.data);
          setUsuariosMsg(null);
        })
        .catch(err => {
          setUsuariosMsg("Erro ao buscar usuários.");
        });
    }
  }, [page, token]);

  // Agrupar usuários por nome
  const usuariosAgrupados = usuarios.reduce((acc: Record<string, Usuario[]>, user) => {
    acc[user.nome] = acc[user.nome] || [];
    acc[user.nome].push(user);
    return acc;
  }, {});

  // --- RENDER ---
  return (
    <div style={{ maxWidth: 600, margin: "0 auto", padding: 24 }}>
      <nav style={{ marginBottom: 24 }}>
        <button onClick={() => setPage("cadastro")}>Cadastro Usuário</button>
        <button onClick={() => setPage("login")}>Login Admin</button>
        {token && <button onClick={() => setPage("admin")}>Listar Usuários</button>}
      </nav>

      {page === "cadastro" && (
        <form onSubmit={handleCadastroSubmit} encType="multipart/form-data">
          <h2>Cadastro de Usuário</h2>
          <input name="nome" placeholder="Nome" value={form.nome || ""} onChange={handleCadastroChange} required /><br />
          <input name="cpf" placeholder="CPF" value={form.cpf || ""} onChange={handleCadastroChange} required /><br />
          <input name="nascimento" placeholder="Nascimento (YYYY-MM-DD)" value={form.nascimento || ""} onChange={handleCadastroChange} required /><br />
          <input name="nacionalidade" placeholder="Nacionalidade" value={form.nacionalidade || ""} onChange={handleCadastroChange} required /><br />
          <input name="estado_civil" placeholder="Estado Civil" value={form.estado_civil || ""} onChange={handleCadastroChange} required /><br />
          <input name="nome_pai" placeholder="Nome do Pai" value={form.nome_pai || ""} onChange={handleCadastroChange} required /><br />
          <input name="nome_mae" placeholder="Nome da Mãe" value={form.nome_mae || ""} onChange={handleCadastroChange} required /><br />
          <input name="endereco" placeholder="Endereço" value={form.endereco || ""} onChange={handleCadastroChange} required /><br />
          <input name="telefone" placeholder="Telefone" value={form.telefone || ""} onChange={handleCadastroChange} required /><br />
          <input name="interesses" placeholder="Interesses (separados por vírgula)" value={form.interesses || ""} onChange={handleCadastroChange} required /><br />
          <input name="compras_eventos" placeholder="Compras/Eventos" value={form.compras_eventos || ""} onChange={handleCadastroChange} required /><br />
          <input name="redes_sociais" placeholder="Redes Sociais (separadas por vírgula)" value={form.redes_sociais || ""} onChange={handleCadastroChange} /><br />
          <input name="perfis_esports" placeholder="Perfis eSports (separados por vírgula)" value={form.perfis_esports || ""} onChange={handleCadastroChange} /><br />
          <input type="file" name="documento" accept=".pdf,.jpg,.jpeg,.png" onChange={e => setDocumento(e.target.files?.[0] || null)} required /><br />
          <button type="submit">Cadastrar</button>
          {cadastroMsg && <p>{cadastroMsg}</p>}
        </form>
      )}

      {page === "login" && (
        <form onSubmit={handleLoginSubmit}>
          <h2>Login Admin</h2>
          <input name="login" placeholder="Login" value={login} onChange={e => setLogin(e.target.value)} required /><br />
          <input name="password" type="password" placeholder="Senha" value={password} onChange={e => setPassword(e.target.value)} required /><br />
          <button type="submit">Entrar</button>
          {loginMsg && <p>{loginMsg}</p>}
        </form>
      )}

      {page === "admin" && (
        <div>
          <h2>Usuários Cadastrados</h2>
          {usuariosMsg && <p>{usuariosMsg}</p>}
          {Object.keys(usuariosAgrupados).length === 0 ? (
            <p>Nenhum usuário encontrado.</p>
          ) : (
            Object.entries(usuariosAgrupados).map(([nome, users]) => (
              <div key={nome} style={{ marginBottom: 16 }}>
                <h3>{nome}</h3>
                <ul>
                  {users.map((u, idx) => (
                    <li key={idx}>
                      CPF: {u.cpf} | Nascimento: {u.nascimento} | Nacionalidade: {u.nacionalidade}
                    </li>
                  ))}
                </ul>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}

export default App;