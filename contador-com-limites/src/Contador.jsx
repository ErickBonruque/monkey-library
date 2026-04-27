import { useState } from 'react'
import './Contador.css'

function Contador() {
  const [contador, setContador] = useState(0)
  const [minimo, setMinimo] = useState(0)
  const [maximo, setMaximo] = useState(10)
  const [step, setStep] = useState(1)

  function incrementar() {
    const novo = contador + step
    setContador(novo > maximo ? maximo : novo)
  }

  function decrementar() {
    const novo = contador - step
    setContador(novo < minimo ? minimo : novo)
  }

  function resetar() {
    setContador(minimo > 0 ? minimo : 0)
  }

  function mudarMinimo(e) {
    const valor = Number(e.target.value)
    if (valor > maximo) return
    setMinimo(valor)
    if (contador < valor) setContador(valor)
  }

  function mudarMaximo(e) {
    const valor = Number(e.target.value)
    if (valor < minimo) return
    setMaximo(valor)
    if (contador > valor) setContador(valor)
  }

  function mudarStep(e) {
    const valor = Number(e.target.value)
    if (valor > 0) setStep(valor)
  }

  return (
    <div className="contador">
      <h1>Contador</h1>
      <p className="valor">{contador}</p>

      <div className="botoes">
        <button onClick={decrementar}>-</button>
        <button onClick={resetar}>Resetar</button>
        <button onClick={incrementar}>+</button>
      </div>

      <div className="campo">
        <label>Step:</label>
        <input type="number" min="1" value={step} onChange={mudarStep} />
      </div>

      <div className="campo">
        <label>Mínimo:</label>
        <input type="number" value={minimo} onChange={mudarMinimo} />
      </div>

      <div className="campo">
        <label>Máximo:</label>
        <input type="number" value={maximo} onChange={mudarMaximo} />
      </div>
    </div>
  )
}

export default Contador
