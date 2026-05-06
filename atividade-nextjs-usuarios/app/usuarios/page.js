"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usuariosMock } from "../data/usuarios";

export default function ListaUsuarios() {
  // useState para armazenar a lista de usuários
  const [usuarios, setUsuarios] = useState([]);

  // useEffect para carregar os dados ao abrir a página
  useEffect(() => {
    console.log("Carregando lista de usuários...");
    setUsuarios(usuariosMock);

    // cleanup simples: executado ao sair da página
    return () => {
      console.log("Saindo da página de lista de usuários");
    };
  }, []);

  return (
    <div>
      <h1>Lista de Usuários</h1>
      <ul>
        {usuarios.map((u) => (
          <li key={u.id}>
            <Link className="link" href={`/usuarios/${u.id}`}>
              {u.nome} - {u.email}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
