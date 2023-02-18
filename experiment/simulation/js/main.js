// import * as THREE from 'three';
import { OrbitControls } from './orbit.js'
import * as THREE from './three.js'
import {
  AddLight,
  addSphere,
  addSphereAtCoordinate,
  CheckHover,
  DeleteObject,
  RepeatPattern,
  TranslatePattern,
  updateButtonCSS,
  highlightSelectList,
  moveSelectList,
  checkSCP,
  select_Region,
  CreatePlaneByAtoms,
  VerifyMiller,
  createLattice,
} from './utils.js'

var container = document.getElementById('canvas-main')
//  init camera
var camera = new THREE.PerspectiveCamera(
  75, //FOV
  container.offsetWidth / container.offsetHeight, //aspect ratio
  0.1,
  1000,
)
camera.position.set(20, 20, 20)

// init the renderer and the scene

var scene = new THREE.Scene()
var renderer = new THREE.WebGLRenderer({ antialias: true })
renderer.setClearColor('#000000')
renderer.setSize(container.offsetWidth, container.offsetHeight)
renderer.shadowMap.enabled = true
renderer.shadowMap.type = THREE.PCFSoftShadowMap
// document.body.appendChild(renderer.domElement);
container.appendChild(renderer.domElement)

// console.log(window);
// initialize the axes
var axesHelper = new THREE.AxesHelper(container.clientHeight)
scene.add(axesHelper)

// add light to the  system
const lights = AddLight()
for (let i = 0; i < lights.length; i++) {
  scene.add(lights[i])
}
// init the orbit controls
var controls = new OrbitControls(camera, renderer.domElement)
controls.update()
controls.autoRotate = true
controls.autoRotateSpeed = 0
controls.enablePan = false
controls.enableDamping = true

// to check the current object which keyboard points to
let INTERSECTED

function getMouseCoords(event) {
  var mouse = new THREE.Vector2()
  mouse.x =
    ((event.clientX - renderer.domElement.offsetLeft) /
      renderer.domElement.clientWidth) *
      2 -
    1
  mouse.y =
    -(
      (event.clientY - renderer.domElement.offsetTop) /
      renderer.domElement.clientHeight
    ) *
      2 +
    1
  // mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
  // mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
  //console.log(mouse);
  return mouse
}
var mouse = new THREE.Vector2()
//  detect mouse click
let drag = false
document.addEventListener('mousedown', function (event) {
  drag = false
  mouse = getMouseCoords(event)
})
document.addEventListener('mousemove', function (event) {
  drag = true
  mouse = getMouseCoords(event)
})

document.addEventListener('keydown', function (event) {
  var keyCode = event.key
  if (keyCode == 'd') {
    DeleteObject(mouse, camera, scene, atomList, INTERSECTED)
  }
})

let action = ''

// create a list of atoms in scene
var atomList = []

var SelectAtomList = []
var BoundaryAtomList = []
var CurrentHull
var CurrentHullMesh
var HullMeshList = []

var currentatom = document.getElementById('atomtype')
var atomtype = currentatom.options[currentatom.selectedIndex].text

const LatticeList = [
  'Simple Cubic',
  'Face Centered Cubic',
  'Body Centered Cubic',
  'Hexagonal Packing',
]
var currentLatticeElement = document.getElementById('LatticeList')
var currentLattice =
  currentLatticeElement.options[currentLatticeElement.selectedIndex].text

let currentAtomList = createLattice(LatticeList.indexOf(currentLattice))
for (let i = 0; i < currentAtomList.length; i++) {
  //   console.log(currentAtomList[i])
  scene.add(currentAtomList[i])
  atomList.push(currentAtomList[i])
}
currentLatticeElement.addEventListener('click', function () {
  currentLattice =
    currentLatticeElement.options[currentLatticeElement.selectedIndex].text
  // console.log('lattice change to', currentLattice)
  for (let i = 0; i < currentAtomList.length; i++) {
    scene.remove(currentAtomList[i])
  }
  currentAtomList = []
  for (let i = 0; i < HullMeshList.length; i++) {
    scene.remove(HullMeshList[i])
  }
  HullMeshList = []
  atomList = []
  currentAtomList = createLattice(LatticeList.indexOf(currentLattice))

  for (let i = 0; i < currentAtomList.length; i++) {
    // console.log(currentAtomList[i])
    scene.add(currentAtomList[i])
    atomList.push(currentAtomList[i])
  }
})

var currentmiller = document.getElementById('millertype')
var millertype = currentmiller.options[currentmiller.selectedIndex].text

const millertypelist = [
  [0, 0, 0],
  [0, 0, 1],
  [0, 1, 0],
  [0, 1, 1],
  [1, 0, 0],
  [1, 0, 1],
  [1, 1, 0],
  [1, 1, 1],
]
// const size = 10
// const divisions = 10

// const gridHelper = new THREE.GridHelper(size, divisions)
// scene.add(gridHelper)
function createAGrid(opts) {
  var gridXZ = new THREE.GridHelper(22, 22, 0xffffff, 0x00ff00)
  // gridXZ.scale.set(1, 0.5, 0.25);
  scene.add(gridXZ)

  var gridXY = new THREE.GridHelper(22, 22, 0xffffff, 0x0000ff)
  // gridXY.position.z = -31, 25
  // gridXY.position.y = 125
  gridXY.rotation.x = Math.PI / 2
  scene.add(gridXY)

  var gridYZ = new THREE.GridHelper(22, 22, 0xffffff, 0xff0000)
  // gridYZ.position.x = -125
  // gridYZ.position.y = 125
  gridYZ.rotation.z = Math.PI / 2
  // gridYZ.scale.set(1, 1, 0.25);
  scene.add(gridYZ)
}

// this is a tuple of Plane() class , the final MEsh ( geom + material)
var currentPlane

const CreatePlane = document.getElementById('CreatePlane')
CreatePlane.addEventListener('click', function () {
  //   console.log('creating plane')
  if (SelectAtomList.length != 3) {
    alert('Please select exactly three atoms')
  } else {
    var newplane = CreatePlaneByAtoms(SelectAtomList)
    console.log('finalplane', newplane)
    scene.add(newplane[0])
    currentPlane = newplane
  }
})

const CheckMiller = document.getElementById('CheckMiller')
CheckMiller.addEventListener('click', function () {
  let lbl = document.getElementById('miller-result')
  if (VerifyMiller(currentPlane, millertype) == 1) {
    lbl.innerHTML = "<span style='color: green;'>Correct</span>"
  } else {
    lbl.innerHTML = "<span style='color: red;'>InCorrect</span>"
  }
})

// respond to select a bunch of atoms
const addSelectList = document.getElementById('SelectAtom')
addSelectList.addEventListener('click', function () {
  console.log('selecting atom mode')
  if (action != 'selectAtom') {
    action = 'selectAtom'
  } else {
    action = ''
    SelectAtomList = []
  }
})

// make the window responsive
window.addEventListener('resize', () => {
  renderer.setSize(container.offsetWidth, container.offsetHeight)
  camera.aspect = container.offsetWidth / container.offsetHeight
  camera.updateProjectionMatrix()
})

document.addEventListener('mouseup', function (event) {
  if (drag == false) {
    // if the action is add atom
    if (action == 'addAtom') {
      var newSphere = addSphere(mouse, atomtype, camera, scene)
      scene.add(newSphere)
      atomList.push(newSphere)
    } else if (action == 'selectAtom') {
      INTERSECTED = CheckHover(mouse, camera, atomList, INTERSECTED)
      if (INTERSECTED) {
        SelectAtomList.push(INTERSECTED)
      }
    } else if (action == 'selectAll') {
      SelectAtomList = []
      for (let i = 0; i < atomList.length; i++) {
        SelectAtomList.push(atomList[i])
      }
    }
  }
})

createAGrid()
// console.log('added system')

// render the scene and animate
var render = function () {
  //   console.log(SelectAtomList)
  //console.log(BoundaryAtomList);
  //   console.log('huh')
  currentatom = document.getElementById('atomtype')
  atomtype = currentatom.options[currentatom.selectedIndex].text

  //   currentlattice = document.getElementById('latticetype')
  //   latticetype = currentlattice.options[currentlattice.selectedIndex].text

  currentmiller = document.getElementById('millertype')
  millertype = currentmiller.options[currentmiller.selectedIndex].text

  //   console.log(millertype)
  highlightSelectList(SelectAtomList, atomList)
  updateButtonCSS(action)
  INTERSECTED = CheckHover(mouse, camera, atomList, INTERSECTED)
  requestAnimationFrame(render)
  controls.update()
  renderer.render(scene, camera)
}

render()
