const scene = new THREE.Scene();
scene.background = new THREE.Color(0x050505);

const camera = new THREE.PerspectiveCamera(75, innerWidth / innerHeight, 0.1, 1000);

const renderer = new THREE.WebGLRenderer({ antialias:true });
renderer.setSize(innerWidth, innerHeight);
document.body.appendChild(renderer.domElement);

// LUZ
const light = new THREE.PointLight(0xff66ff, 2);
light.position.set(0,10,5);
scene.add(light);

const ambient = new THREE.AmbientLight(0x222222);
scene.add(ambient);

// CHÃO
const floor = new THREE.Mesh(
  new THREE.PlaneGeometry(80, 80),
  new THREE.MeshStandardMaterial({ color:0x151515 })
);
floor.rotation.x = -Math.PI / 2;
scene.add(floor);

// PLAYER
const player = new THREE.Mesh(
  new THREE.BoxGeometry(1, 2, 1),
  new THREE.MeshStandardMaterial({ color:0xff4fd8 })
);
player.position.set(0, 1, 8);
scene.add(player);

// ZUMBIS
let zombies = [];
for (let i = 0; i < 5; i++) {
  const zombie = new THREE.Mesh(
    new THREE.BoxGeometry(1, 2, 1),
    new THREE.MeshStandardMaterial({ color:0x28ff4f })
  );
  zombie.position.set(Math.random()*20-10, 1, Math.random()*-20);
  scene.add(zombie);
  zombies.push(zombie);
}

// PORTA
const door = new THREE.Mesh(
  new THREE.BoxGeometry(4, 4, .5),
  new THREE.MeshStandardMaterial({ 
    color: 0x111111,
    emissive: 0x7a3cff,
    emissiveIntensity: 0.5
  })
);
door.position.set(0, 2, -25);
scene.add(door);

// NPC
const npc = new THREE.Mesh(
  new THREE.BoxGeometry(1, 1, 1),
  new THREE.MeshStandardMaterial({ color:0x4488ff })
);
npc.position.set(0, .5, -35);
scene.add(npc);

// PAREDES
function criarParede(x, z, largura, altura, profundidade) {
  const parede = new THREE.Mesh(
    new THREE.BoxGeometry(largura, altura, profundidade),
    new THREE.MeshStandardMaterial({ color: 0x222222 })
  );
  parede.position.set(x, altura/2, z);
  scene.add(parede);
}

criarParede(0, -30, 40, 6, 1);
criarParede(0, 20, 40, 6, 1);
criarParede(-20, -5, 1, 6, 50);
criarParede(20, -5, 1, 6, 50);

// CONTROLES
let keys = {};
let doorUnlocked = false;
let doorOpen = false;
let finalShown = false;

const interact = document.getElementById("interact");

document.addEventListener("keydown", e => {
  keys[e.key.toLowerCase()] = true;

  if (e.key.toLowerCase() === "e") {

    if (player.position.distanceTo(door.position) < 5 && doorUnlocked && !doorOpen) {
      const code = prompt("Digite o código:");
      if (code === "1506") {
        doorOpen = true;
        scene.remove(door);
        alert("A porta abriu...");
      } else {
        alert("Código errado.");
      }
    }

    if (player.position.distanceTo(npc.position) < 3 && doorOpen) {
      showFinal();
    }
  }
});

document.addEventListener("keyup", e => keys[e.key.toLowerCase()] = false);

// TIRO
document.addEventListener("click", () => {
  if (zombies.length > 0) {
    const z = zombies.pop();
    scene.remove(z);
    document.getElementById("zombies").textContent = zombies.length;

    if (zombies.length === 0) {
      doorUnlocked = true;
      alert("Todos os zumbis derrotados. Vá até a porta!");
    }
  }
});

// FINAL
function showFinal() {
  if (finalShown) return;
  finalShown = true;

  const texto = document.getElementById("textoFinal");
  document.getElementById("final").style.display = "block";

  let frase = `
Mesmo depois de tudo que você passou...<br><br>
eu sei que não foi fácil.<br><br>
Mas mesmo assim... você continuou.<br><br>
E mesmo no meio do caos...<br>
você veio até mim.<br><br>
E eu quero que você saiba...<br><br>
eu te amo de verdade. ❤️
`;

  let i = 0;
  function escrever() {
    if (i < frase.length) {
      texto.innerHTML += frase.charAt(i);
      i++;
      setTimeout(escrever, 30);
    }
  }
  escrever();
}

// LOOP
function animate() {
  requestAnimationFrame(animate);

  const speed = 0.15;
  const rotationSpeed = 0.05;

  // GIRAR
  if (keys["a"]) player.rotation.y += rotationSpeed;
  if (keys["d"]) player.rotation.y -= rotationSpeed;

  // ANDAR
  if (keys["w"]) {
    player.position.x -= Math.sin(player.rotation.y) * speed;
    player.position.z -= Math.cos(player.rotation.y) * speed;
  }

  if (keys["s"]) {
    player.position.x += Math.sin(player.rotation.y) * speed;
    player.position.z += Math.cos(player.rotation.y) * speed;
  }

  // ZUMBIS SEGUINDO
  zombies.forEach(z => {
    z.lookAt(player.position);
    z.position.x += (player.position.x - z.position.x) * 0.005;
    z.position.z += (player.position.z - z.position.z) * 0.005;
  });

  // INTERAÇÃO
  if (player.position.distanceTo(door.position) < 5 && doorUnlocked && !doorOpen) {
    interact.style.display = "block";
  } else if (player.position.distanceTo(npc.position) < 3 && doorOpen) {
    interact.style.display = "block";
  } else {
    interact.style.display = "none";
  }

  // CAMERA
  camera.position.x = player.position.x + Math.sin(player.rotation.y) * 8;
  camera.position.z = player.position.z + Math.cos(player.rotation.y) * 8;
  camera.position.y = player.position.y + 5;

  camera.lookAt(player.position);

  renderer.render(scene, camera);
}
animate();

// RESIZE
window.addEventListener("resize", () => {
  camera.aspect = innerWidth / innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(innerWidth, innerHeight);
});
