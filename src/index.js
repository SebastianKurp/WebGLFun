import * as THREE from "three";
import ReactDOM from "react-dom";
import React, { useRef, useMemo, useState, useEffect } from "react";
import { Canvas, useFrame } from "react-three-fiber";
import niceColors from "nice-color-palettes";
import Slider, { Range } from "rc-slider";
import "rc-slider/assets/index.css";
import "./index.css";

const _object = new THREE.Object3D();
const _color = new THREE.Color();

function Box(props) {
  // This reference will give us direct access to the mesh
  const mesh = useRef();

  // Set up state for the hovered and active state
  const [hovered, setHover] = useState(false);
  const [active, setActive] = useState(false);

  // Rotate mesh every frame, this is outside of React without overhead
  useFrame(() => (mesh.current.rotation.x = mesh.current.rotation.y += 0.01));

  return (
    <mesh
      {...props}
      ref={mesh}
      scale={active ? [3, 3, 3] : [1, 1, 1]}
      onClick={(e) => setActive(!active)}
      onPointerOver={(e) => setHover(true)}
      onPointerOut={(e) => setHover(false)}
    >
      <boxBufferGeometry attach="geometry" args={[1, 1, 1]} />
      <meshStandardMaterial
        attach="material"
        color={hovered ? "hotpink" : "green"}
      />
    </mesh>
  );
}

const Boxes = ({ numOfCubes }) => {
  const [hovered, set] = useState();
  const previous = useRef();
  useEffect(() => void (previous.current = hovered), [hovered]);

  const ref = useRef();
  const attrib = useRef();

  const colors = useMemo(
    () =>
      new Array(numOfCubes)
        .fill()
        .map(() => niceColors[14][Math.floor(Math.random() * 10)]),
    []
  );
  const colorArray = useMemo(() => {
    const color = new Float32Array(numOfCubes * 3);
    for (let i = 0; i < numOfCubes; i++) {
      _color.set(colors[i]);
      _color.toArray(color, i * 3);
    }
    return color;
  }, []);

  useFrame((state) => {
    const time = state.clock.getElapsedTime();
    ref.current.rotation.x = Math.sin(time / 1);
    ref.current.rotation.y = Math.sin(time / 1);
    let i = 0;
    for (let x = 0; x < 10; x++)
      for (let y = 0; y < 10; y++)
        for (let z = 0; z < 10; z++) {
          const id = i++;
          _object.position.set(5 - x, 5 - y, 5 - z);
          _object.rotation.y =
            Math.sin(x / 4 + time) +
            Math.sin(y / 4 + time) +
            Math.sin(z / 4 + time);
          _object.rotation.z = _object.rotation.y * 2;
          if (hovered !== previous.current) {
            _color.set(id === hovered ? "white" : colors[id]);
            _color.toArray(colorArray, id * 3);
            attrib.current.needsUpdate = true;
          }
          const scale = id === hovered ? 2 : 1;
          _object.scale.set(scale, scale, scale);
          _object.updateMatrix();
          ref.current.setMatrixAt(id, _object.matrix);
        }
    ref.current.instanceMatrix.needsUpdate = true;
  });

  return (
    <instancedMesh ref={ref} args={[null, null, numOfCubes]}>
      <boxBufferGeometry attach="geometry" args={[0.7, 0.7, 0.7]}>
        <instancedBufferAttribute
          ref={attrib}
          attachObject={["attributes", "color"]}
          args={[colorArray, 3]}
        />
      </boxBufferGeometry>
      <meshPhongMaterial attach="material" vertexColors={THREE.VertexColors} />
    </instancedMesh>
  );
};
ReactDOM.render(
  <>
    <Slider />
    <Canvas
      camera={{ position: [0, 0, 15], near: 5, far: 20 }}
      onCreated={({ gl }) => {
        gl.toneMapping = THREE.Uncharted2ToneMapping;
        gl.setClearColor(new THREE.Color("biege"));
      }}
    >
      <ambientLight />
      <pointLight position={[150, 150, 150]} intensity={0.55} />
      <Boxes numOfCubes={1000} />
    </Canvas>
  </>,
  document.getElementById("root")
);
