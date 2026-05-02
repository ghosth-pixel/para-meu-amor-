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
  new THREE.MeshStandardMaterial({ color:0x7a3cff })
);
door.position.set(0, 2, -25);
scene.add(door);

// NPC FINAL
const npc = new THREE.Mesh(
  new THREE.BoxGeometry(1, 1, 1),
  new THREE.MeshStandardMaterial({ color:0x4488ff })
);
npc.position.set(0, .5, -35);
scene.add(npc);

// CONTROLES
let keys = {};
let doorUnlocked = false;
let doorOpen = false;
let finalShown = false;

document.addEventListener("keydown", e => {
  keys[e.key.toLowerCase()] = true;

  if (e.key.toLowerCase() === "e") {

    // PORTA
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

    // FINAL
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

// FINAL BONITO
function showFinal() {
  if (finalShown) return;
  finalShown = true;

  const texto = document.getElementById("textoFinal");
  document.getElementById("final").style.display = "block";

  let frase = `
  Mesmo depois de tudo que você passou...<br><br>
  você nunca desistiu.<br><br>
  E mesmo assim... você veio até mim.<br><br>
  E é por isso que eu te amo ❤️
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

  if (keys["w"]) player.position.z -= speed;
  if (keys["s"]) player.position.z += speed;
  if (keys["a"]) player.position.x -= speed;
  if (keys["d"]) player.position.x += speed;

  // ZUMBIS SEGUINDO
  zombies.forEach(z => {
    z.lookAt(player.position);
    z.position.x += (player.position.x - z.position.x) * 0.005;
    z.position.z += (player.position.z - z.position.z) * 0.005;
  });

  // CAMERA
  camera.position.set(player.position.x, player.position.y + 5, player.position.z + 10);
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
