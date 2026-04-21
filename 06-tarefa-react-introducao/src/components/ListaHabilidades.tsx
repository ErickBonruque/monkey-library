type ListaHabilidadesProps = {
  itens: string[];
};

function ListaHabilidades({ itens }: ListaHabilidadesProps) {
  return (
    <section>
      <h2>Habilidades</h2>
      <ul>
        {itens.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
    </section>
  );
}

export default ListaHabilidades;
