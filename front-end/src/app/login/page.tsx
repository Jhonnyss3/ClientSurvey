"use client";
import { useState } from "react";
import api from "../../services/api";
import styles from "./formLogin.module.css";

export default function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [msg, setMsg] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setMsg(null);
    try {
      const params = new URLSearchParams();
      params.append("username", username);
      params.append("password", password);
      params.append("grant_type", "password");

      const res = await api.post("/admin/login/", params, {
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
      });

      localStorage.setItem("token", res.data.access_token);
      setMsg("Login realizado!");
      window.location.href = "/usuarios";
    } catch (err: any) {
      setMsg(err?.response?.data?.detail || "Erro no login.");
    }
  };

  return (
    <div className={styles.page}>
      <form method="POST" className={styles.formLogin} onSubmit={handleLogin}>
        <h1>Login</h1>
        <p>Digite os seus dados de acesso no campo abaixo.</p>
        <label htmlFor="email">Login</label>
        <input
          type="text"
          id="username"
          placeholder="Digite seu login"
          autoFocus
          value={username}
          onChange={e => setUsername(e.target.value)}
          required
        />
        <label htmlFor="password">Senha</label>
        <input
          type="password"
          id="password"
          placeholder="Digite sua senha"
          value={password}
          onChange={e => setPassword(e.target.value)}
          required
        />
        <a href="/">Esqueci minha senha</a>
        <input type="submit" value="Acessar" className={styles.btn} />
        {msg && <p>{msg}</p>}
      </form>
    </div>
  );
}