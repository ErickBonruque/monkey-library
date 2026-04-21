import Botao from './Botao';

function Header() {
  return (
    <header className="header">
      <h1>Meu Primeiro App React</h1>
      <nav>
        <Botao texto="Início" para="/" />
        <Botao texto="Perfil" para="/perfil" />
        <Botao texto="Habilidades" para="/habilidades" />
      </nav>
    </header>
  );
}

export default Header;
