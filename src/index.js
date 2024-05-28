 // Basic setup
 const scene = new THREE.Scene();
 const camera = new THREE.PerspectiveCamera(
   75,
   window.innerWidth / window.innerHeight,
   0.1,
   1000
 );
 const renderer = new THREE.WebGLRenderer();
 renderer.setSize(window.innerWidth, window.innerHeight);
 document.body.appendChild(renderer.domElement);

 // Lighting
 const light = new THREE.PointLight(0xffffff, 1, 100);
 light.position.set(10, 10, 10);
 scene.add(light);

 // Board
 const boardSize = 8;
 const squareSize = 1;
 const board = new THREE.Group();

 for (let x = 0; x < boardSize; x++) {
   for (let z = 0; z < boardSize; z++) {
     const geometry = new THREE.PlaneGeometry(squareSize, squareSize);
     const color = (x + z) % 2 === 0 ? 0xffffff : 0x000000;
     const material = new THREE.MeshBasicMaterial({
       color,
       side: THREE.DoubleSide,
     });
     const square = new THREE.Mesh(geometry, material);
     square.rotation.x = -Math.PI / 2;
     square.position.set(x - boardSize / 2, 0, z - boardSize / 2);
     board.add(square);
   }
 }

 scene.add(board);

 // Pieces
 const pieceGeometry = new THREE.CylinderGeometry(0.4, 0.4, 0.2, 32);
 const whiteMaterial = new THREE.MeshLambertMaterial({ color: 0xffffff });
 const blackMaterial = new THREE.MeshLambertMaterial({ color: 0x000000 });

 const pieces = [];
 for (let x = 0; x < boardSize; x++) {
   for (let z = 0; z < boardSize; z++) {
     if ((x + z) % 2 === 1) {
       if (z < 3) {
         const piece = new THREE.Mesh(pieceGeometry, blackMaterial);
         piece.position.set(x - boardSize / 2, 0.1, z - boardSize / 2);
         piece.userData = { color: 'black', x, z };
         pieces.push(piece);
         scene.add(piece);
       } else if (z > 4) {
         const piece = new THREE.Mesh(pieceGeometry, whiteMaterial);
         piece.position.set(x - boardSize / 2, 0.1, z - boardSize / 2);
         piece.userData = { color: 'white', x, z };
         pieces.push(piece);
         scene.add(piece);
       }
     }
   }
 }

 // Camera position
 camera.position.set(0, 10, 10);
 camera.lookAt(0, 0, 0);

 // Controls and selection
 let selectedPiece = null;
 const raycaster = new THREE.Raycaster();
 const mouse = new THREE.Vector2();

 function onMouseMove(event) {
   mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
   mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
 }

 function onMouseDown(event) {
   raycaster.setFromCamera(mouse, camera);
   const intersects = raycaster.intersectObjects(pieces);

   if (intersects.length > 0) {
     const piece = intersects[0].object;
     if (!selectedPiece) {
       selectedPiece = piece;
       piece.material.emissive.setHex(0xff0000);
     } else {
       selectedPiece.material.emissive.setHex(0x000000);
       const targetPosition = new THREE.Vector3(
         Math.round(piece.position.x),
         piece.position.y,
         Math.round(piece.position.z)
       );
       selectedPiece.position.set(targetPosition.x, targetPosition.y, targetPosition.z);
       selectedPiece.userData.x = targetPosition.x + boardSize / 2;
       selectedPiece.userData.z = targetPosition.z + boardSize / 2;
       selectedPiece = null;
     }
   } else if (selectedPiece) {
     raycaster.setFromCamera(mouse, camera);
     const intersects = raycaster.intersectObjects(board.children);

     if (intersects.length > 0) {
       const square = intersects[0].object;
       const targetPosition = new THREE.Vector3(
         Math.round(square.position.x),
         selectedPiece.position.y,
         Math.round(square.position.z)
       );
       selectedPiece.position.set(targetPosition.x, targetPosition.y, targetPosition.z);
       selectedPiece.userData.x = targetPosition.x + boardSize / 2;
       selectedPiece.userData.z = targetPosition.z + boardSize / 2;
       selectedPiece.material.emissive.setHex(0x000000);
       selectedPiece = null;
     }
   }
 }

 window.addEventListener('mousemove', onMouseMove, false);
 window.addEventListener('mousedown', onMouseDown, false);

 // Render loop
 function animate() {
   requestAnimationFrame(animate);
   renderer.render(scene, camera);
 }
 animate();