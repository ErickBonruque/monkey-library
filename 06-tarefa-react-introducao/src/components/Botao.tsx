import { NavLink } from 'react-router-dom';

type BotaoProps = {
  texto: string;
  para: string;
};

function Botao({ texto, para }: BotaoProps) {
  return (
    <NavLink
      to={para}
      className={({ isActive }) =>
        isActive ? 'btn-nav btn-nav-ativo' : 'btn-nav'
      }
    >
      {texto}
    </NavLink>
  );
}

export default Botao;
