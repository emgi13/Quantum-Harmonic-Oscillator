import React from 'react';
import { add, BigNumber, eigs, MathCollection, Matrix, matrix, multiply, zeros } from 'mathjs';
import p5 from 'p5';
import './styles.scss';

const App = () => {
  return <QHO k={100000} length={201} mass={1} />
}

class QHO extends React.Component<QHOProps> {
  p5ref: React.RefObject<HTMLDivElement>;
  p5: p5 | undefined;
  active: boolean;
  debounceTimeout: number | undefined;
  frameRate: number;
  skipFrames: number;
  frameNo: number;
  xs: number[];
  vs: number[];
  V: Matrix;
  basis: Matrix;
  dx: number;
  lap: Matrix;
  H: Matrix;
  ev: { value: number | BigNumber, vector: MathCollection }[];
  constructor(props: QHOProps) {
    super(props);
    this.p5ref = React.createRef();
    this.active = true;
    this.frameRate = props.frameRate || 24;
    this.skipFrames = props.skipFrames || 30;
    this.frameNo = 0;

    const { length, k, mass } = this.props;
    // define coordinates [0, ..., 1]
    this.xs = Array.from({ length: length }).map((_, ind) => ind * 1.0 / (length - 1))
    // Define the potential 
    this.vs = this.xs.map(v => 0.5 * k * (v - 0.5) ** 2)
    this.V = matrix(zeros(length, length));
    this.vs.forEach((val, ind) => this.V.set([ind, ind], val))
    // make basis matrix
    this.basis = matrix(zeros(length, length));
    this.xs.forEach((val, ind) => this.basis.set([ind, ind], val))
    console.log(this.basis)
    this.dx = this.xs[1] - this.xs[0];
    console.log(this.dx)
    // laplacian matrix
    this.lap = matrix(zeros(this.basis.size()));
    this.xs.forEach((_, ind: number) => {
      this.lap.set([ind, ind], -2.0 / this.dx / this.dx)
      if (ind > 0) {
        this.lap.set([ind, ind - 1], 1.0 / this.dx / this.dx)
      }
      if (ind < length - 1) {
        this.lap.set([ind, ind + 1], 1.0 / this.dx / this.dx)
      }
    })
    // Hamiltonian
    this.H = add(multiply(this.lap, -1 / 2.0 / mass), this.V)
    // Eiqenvectors
    this.ev = eigs(this.H).eigenvectors;
    console.log(this.ev[0])

    // binds
    this.handleScroll = this.handleScroll.bind(this);
    this.handleScrollDebounced = this.handleScrollDebounced.bind(this);
  }

  handleTouch() {
    this.active = true;
    this.frameRate = this.props.frameRate || 30;
    this.skipFrames = this.props.skipFrames || 20;
    this.frameNo = 0;
  }

  handleScrollDebounced() {
    clearTimeout(this.debounceTimeout);
    this.debounceTimeout = setTimeout(this.handleScroll, 100); // Adjust the delay as needed
  }

  handleScroll() {
    const inView = this.canvasInView();
    if (this.active && !inView) {
      this.p5!.frameRate(0);
      this.active = false;
    } else if (!this.active && inView) {
      this.p5!.frameRate(this.frameRate);
      this.active = true;
    }
  }

  canvasInView() {
    const canvas = this.p5ref.current!;
    const rect = canvas.getBoundingClientRect();
    const windowHeight = window.innerHeight;
    return (
      rect.bottom > 0 && // Bottom edge is below the top of the viewport
      rect.top < windowHeight // Top edge is above the bottom of the viewport
    );
  }

  componentDidMount(): void {
    this.p5 = new p5(this.sketch, this.p5ref.current as HTMLElement);
    this.p5ref?.current?.addEventListener("click", () => this.handleTouch());
  }

  componentWillUnmount(): void {
    if (this.p5) {
      this.p5.remove();
    }
  }

  sketch = (p: p5) => {
    p.setup = () => {
      const width = this.p5ref.current?.offsetWidth || 400;
      const height = width;
      p.createCanvas(width, height);
      p.background(0, 0, 0);
      p.frameRate(this.frameRate);
      p.strokeWeight(0.3);
      p.noLoop()
      window.addEventListener("scroll", this.handleScrollDebounced, {
        passive: true,
      });
    };

    p.draw = () => {
      p.stroke('white')
      p.strokeWeight(0.3)
      const scale = 400;
      this.ev.forEach((state, level) => {
        if (level < 10) {
          const ys: any = state.vector.valueOf();
          for (let i = 1; i < this.props.length; i++) {

            p.line(this.xs[i - 1] * scale, scale * (1 - ys[i - 1]), this.xs[i] * scale, (1 - ys[i]) * scale)
          }
        }

      });
    }
  }

  render() {
    return <div className="QHO">
      <div className="canvas-cont" ref={this.p5ref}></div>
    </div>
  }

}




export default App;
