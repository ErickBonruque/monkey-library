type CardPerfilProps = {
  nome: string;
  curso: string;
  semestre: string;
};

function CardPerfil({ nome, curso, semestre }: CardPerfilProps) {
  return (
    <section>
      <h2>{nome}</h2>
      <p>Curso: {curso}</p>
      <p>Semestre: {semestre}</p>
    </section>
  );
}

export default CardPerfil;
