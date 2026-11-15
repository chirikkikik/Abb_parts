import * as THREE from "three";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import { DRACOLoader } from "three/addons/loaders/DRACOLoader.js";

export async function createModelScene({
  container,
  models,
  background = 0x080d18,
  staticRender = false,
  autoRotateSpeed = 0,
  onHover = () => {},
  onClick = () => {},
}) {
  const scene = new THREE.Scene();
  // Прозорий фон дозволяє зберегти оригінальний дизайн картки.
  scene.background = null;

  const camera = new THREE.PerspectiveCamera(
    40,
    Math.max(container.clientWidth, 1) / Math.max(container.clientHeight, 1),
    0.1,
    1000
  );

  camera.position.set(0, 0, 11);

  const renderer = new THREE.WebGLRenderer({
    antialias: true,
    alpha: true,
  });

  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setSize(
    Math.max(container.clientWidth, 1),
    Math.max(container.clientHeight, 1)
  );
  renderer.setClearColor(0x000000, 0);
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1;

  container.innerHTML = "";
  container.appendChild(renderer.domElement);

  // Освітлення для реалістичних матеріалів GLB
  scene.add(new THREE.HemisphereLight(0xffffff, 0x303040, 2));

  const sunLight = new THREE.DirectionalLight(0xffffff, 3);
  sunLight.position.set(4, 7, 5);
  scene.add(sunLight);

  const fillLight = new THREE.DirectionalLight(0x8caaff, 1);
  fillLight.position.set(-4, 3, -5);
  scene.add(fillLight);

  const dracoLoader = new DRACOLoader();
  dracoLoader.setDecoderPath("/draco/");
  const loader = new GLTFLoader();
  loader.setDRACOLoader(dracoLoader);
  const clickableObjects = [];
  const loadedModels = [];

  let cameraTarget = new THREE.Vector3(0, 0, 0);

function fitCameraToModel(model, fill = 0.75) {
  const box = new THREE.Box3().setFromObject(model);

  const size = box.getSize(new THREE.Vector3());
  const center = box.getCenter(new THREE.Vector3());

  // Центр моделі — точка, на яку дивиться камера
  cameraTarget.copy(center);

  const verticalFov = THREE.MathUtils.degToRad(camera.fov);
  const horizontalFov = 2 * Math.atan(
    Math.tan(verticalFov / 2) * camera.aspect
  );

  // Визначаємо потрібну відстань для повного відображення
  const distanceHeight =
    (size.y / 2) / Math.tan(verticalFov / 2);

  const distanceWidth =
    (size.x / 2) / Math.tan(horizontalFov / 2);

  const distanceDepth = size.z / 2;

  const distance = Math.max(
    distanceHeight,
    distanceWidth,
    distanceDepth
  ) / fill;

  camera.position.set(
    center.x,
    center.y,
    center.z + distance
  );

  camera.lookAt(cameraTarget);
}

  for (const item of models) {
    try {
      const gltf = await loader.loadAsync(item.path);
      const model = gltf.scene;

      // Автоматично нормалізуємо розмір моделі
      const box = new THREE.Box3().setFromObject(model);
      const size = box.getSize(new THREE.Vector3());
      const center = box.getCenter(new THREE.Vector3());

      const maxDimension = Math.max(size.x, size.y, size.z);
      const scale = item.scale ?? (
        (3 * (item.scaleMultiplier ?? 1)) / maxDimension
      );

      model.scale.setScalar(scale);

      // Ставимо модель на поверхню
      model.position.set(
        item.position.x,
        item.position.y ?? 0,
        item.position.z
      );

      // Центруємо модель відносно її основи
      model.position.x -= center.x * scale;
      model.position.z -= center.z * scale;
      model.position.y -= box.min.y * scale;

      model.rotation.y = item.rotation ?? Math.PI / 4;;

      model.traverse((child) => {
        if (child.isMesh) {
          child.castShadow = true;
          child.receiveShadow = true;
        }
      });

      model.userData.characterId = item.id;
      model.userData.title = item.title;

      scene.add(model);
      if (loadedModels.length === 0) {
        fitCameraToModel(model, item.cameraFill ?? 0.75);
      }
      clickableObjects.push(model);
      loadedModels.push(model);
    } catch (error) {
      console.error(`Не вдалося завантажити ${item.path}`, error);
    }
  }

  const raycaster = new THREE.Raycaster();
  const pointer = new THREE.Vector2();

  let hoveredId = null;

  function getIntersections(event) {
    const rect = renderer.domElement.getBoundingClientRect();

    pointer.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    pointer.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

    raycaster.setFromCamera(pointer, camera);

    return raycaster.intersectObjects(clickableObjects, true);
  }

  function getModelFromObject(object) {
    let current = object;

    while (current && !current.userData.characterId) {
      current = current.parent;
    }

    return current;
  }

  function handlePointerMove(event) {
    const intersections = getIntersections(event);
    const model = intersections.length
      ? getModelFromObject(intersections[0].object)
      : null;

    const id = model?.userData.characterId ?? null;

    if (id !== hoveredId) {
      hoveredId = id;
      renderer.domElement.style.cursor = id ? "pointer" : "default";
      onHover(id);
    }
  }

  function handleClick(event) {
    const intersections = getIntersections(event);

    if (!intersections.length) return;

    const model = getModelFromObject(intersections[0].object);

    if (model) {
      onClick(model.userData.characterId);
    }
  }

  renderer.domElement.addEventListener("pointermove", handlePointerMove);
  renderer.domElement.addEventListener("click", handleClick);

function resize() {
    const width = container.clientWidth;
    const height = container.clientHeight;

    if (!width || !height) return;

    camera.aspect = width / height;
    camera.updateProjectionMatrix();

    if (loadedModels.length > 0) {
      fitCameraToModel(
        loadedModels[0],
        models[0].cameraFill ?? 0.75
      );
    }

    renderer.setSize(width, height);

    if (staticRender) {
      renderer.render(scene, camera);
    }
  }

  const resizeObserver = new ResizeObserver(resize);
  resizeObserver.observe(container);

  let animationId;

  function animate() {
    if (staticRender) {
      renderer.render(scene, camera);
      return;
    }

    animationId = requestAnimationFrame(animate);

    if (autoRotateSpeed !== 0) {
      loadedModels.forEach((model) => {
        model.rotation.y += autoRotateSpeed;
      });
    }

    renderer.render(scene, camera);
  }

  animate();

  return {
    scene,
    camera,
    renderer,
    models: loadedModels,

    dispose() {
      cancelAnimationFrame(animationId);
      resizeObserver.disconnect();

      renderer.domElement.removeEventListener(
        "pointermove",
        handlePointerMove
      );

      renderer.domElement.removeEventListener("click", handleClick);

      loadedModels.forEach((model) => {
        model.traverse((child) => {
          if (!child.isMesh) return;

          child.geometry?.dispose();

          const materials = Array.isArray(child.material)
            ? child.material
            : [child.material];

          materials.forEach((material) => {
            if (!material) return;

            Object.values(material).forEach((value) => {
              if (value && value.isTexture) value.dispose();
            });

            material.dispose();
          });
        });
      });

      renderer.dispose();
      container.innerHTML = "";
    },
  };
}
