import { add, eigs, matrix, multiply, zeros } from 'mathjs';
import './styles.scss';

const App = () => {
  return <QHO k={100} length={101} mass={1} />
}

const QHO = (props: QHOProps) => {
  // define coordinates [0, ..., 1]
  const x = Array.from({ length: props.length }).map((_, ind) => ind * 1.0 / (props.length - 1))
  console.log(x)
  // Define the potential 
  const v = x.map(v => 0.5 * props.k * (v - 0.5) ** 2)
  const V = matrix(zeros(props.length, props.length));
  v.forEach((val, ind) => V.set([ind, ind], val))
  console.log(v)
  // make basis matrix
  const basis = matrix(zeros(props.length, props.length));
  x.forEach((val, ind) => basis.set([ind, ind], val))
  console.log(basis)
  const dx = x[1] - x[0];
  console.log(dx)
  // laplacian matrix
  const lap = matrix(zeros(basis.size()));
  x.forEach((_, ind) => {
    lap.set([ind, ind], -2.0 / dx / dx)
    if (ind > 0) {
      lap.set([ind, ind - 1], 1.0 / dx / dx)
    }
    if (ind < props.length - 1) {
      lap.set([ind, ind + 1], 1.0 / dx / dx)
    }
  })
  console.log(lap)
  // Hamiltonian
  const H = add(multiply(lap, -1 / 2.0 / props.mass), V)
  console.log(H)
  // Eiqenvectors
  const { eigenvectors: ev } = eigs(H)
  console.log(ev[0])
  return <div>{props.k}</div>
}


export default App;
