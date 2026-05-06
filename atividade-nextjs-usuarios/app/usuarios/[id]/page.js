"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { usuariosMock } from "../../data/usuarios";

export default function DetalhesUsuario() {
  // Captura o ID da URL
  const params = useParams();
  const id = Number(params.id);

  // useState para armazenar o usuário encontrado
  const [usuario, setUsuario] = useState(null);

  // useEffect que reage à mudança do ID na URL
  useEffect(() => {
    console.log("Buscando usuário com id:", id);
    const encontrado = usuariosMock.find((u) => u.id === id);
    setUsuario(encontrado || null);

    // cleanup simples ao sair da página ou trocar de id
    return () => {
      console.log("Saindo da página de detalhes do usuário", id);
    };
  }, [id]);

  if (!usuario) {
    return (
      <div>
        <h1>Usuário não encontrado</h1>
        <Link className="link" href="/usuarios">Voltar para a lista</Link>
      </div>
    );
  }

  return (
    <div>
      <h1>Detalhes do Usuário</h1>
      <p><strong>ID:</strong> {usuario.id}</p>
      <p><strong>Nome:</strong> {usuario.nome}</p>
      <p><strong>Email:</strong> {usuario.email}</p>
      <Link className="link" href="/usuarios">Voltar para a lista</Link>
    </div>
  );
}
