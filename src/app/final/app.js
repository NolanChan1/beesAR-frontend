/*
 * Copyright 2017 Google Inc. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the 'License');
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an 'AS IS' BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

/**
 * Query for WebXR support. If there's no support for the `immersive-ar` mode,
 * show an error.
 */
let enteredAR = false;
let objShow = false;
let retShow = true;
let placed = false;
(async function () {
  const isArSessionSupported =
    navigator.xr &&
    navigator.xr.isSessionSupported &&
    (await navigator.xr.isSessionSupported("immersive-ar"));
  if (isArSessionSupported) {
    document
      .getElementById("enter-ar")
      .addEventListener("click", window.app.activateXR);
  } else {
    onNoXRDevice();
  }
})();

const capture = async () => {
  const canvas = document.createElement("canvas");
  const context = canvas.getContext("2d");
  const video = document.createElement("video");

  try {
    const captureStream = await navigator.mediaDevices.getDisplayMedia();
    video.srcObject = captureStream;
    context.drawImage(video, 0, 0, window.width, window.height);
    const frame = canvas.toDataURL("image/png");
    captureStream.getTracks().forEach((track) => track.stop());
    window.location.href = frame;
  } catch (err) {
    console.error("Error: " + err);
  }
};

// capture();

/**
 * Container class to manage connecting to the WebXR Device API
 * and handle rendering on every frame.
 */
class App {
  /**
   * Run when the Start AR button is pressed.
   */
  activateXR = async () => {
    try {
      // Initialize a WebXR session using "immersive-ar".
      this.xrSession = await navigator.xr.requestSession("immersive-ar", {
        requiredFeatures: ["hit-test", "dom-overlay"],
        domOverlay: { root: document.body },
      });

      // Create the canvas that will contain our camera's background and our virtual scene.
      this.createXRCanvas();

      // With everything set up, start the app.
      await this.onSessionStarted();
    } catch (e) {
      console.log(e);
      onNoXRDevice();
    }
  };

  /**
   * Add a canvas element and initialize a WebGL context that is compatible with WebXR.
   */
  createXRCanvas() {
    this.canvas = document.createElement("canvas");
    document.body.appendChild(this.canvas);
    this.gl = this.canvas.getContext("webgl", { xrCompatible: true });

    this.xrSession.updateRenderState({
      baseLayer: new XRWebGLLayer(this.xrSession, this.gl),
    });
  }

  /**
   * Called when the XRSession has begun. Here we set up our three.js
   * renderer, scene, and camera and attach our XRWebGLLayer to the
   * XRSession and kick off the render loop.
   */
  onSessionStarted = async () => {
    // Add the `ar` class to our body, which will hide our 2D components
    document.body.classList.add("ar");
    const element = document.getElementById("enter-ar");
    element.remove();
    document.getElementById("btn-place").style.display = "unset";

    // To help with working with 3D on the web, we'll use three.js.
    this.setupThreeJs();

    // Setup an XRReferenceSpace using the "local" coordinate system.
    this.localReferenceSpace = await this.xrSession.requestReferenceSpace(
      "local"
    );

    // Create another XRReferenceSpace that has the viewer as the origin.
    this.viewerSpace = await this.xrSession.requestReferenceSpace("viewer");
    // Perform hit testing using the viewer as origin.
    this.hitTestSource = await this.xrSession.requestHitTestSource({
      space: this.viewerSpace,
    });

    // Start a rendering loop using this.onXRFrame.
    this.xrSession.requestAnimationFrame(this.onXRFrame);

    //place obj
    //make it same css as the removed btn
    document.getElementById("btn-place").addEventListener("click", (e) => {
      this.arPlace();
      console.log("button clicked");
    });

    document.getElementById("btn-rotate").addEventListener("click", (e) => {
      this.rotateModel();
    });

    document
      .getElementById("obj-toggle")
      .addEventListener("click", this.objToggle);
    document
      .getElementById("ret-toggle")
      .addEventListener("click", this.retToggle);
    // this.xrSession.addEventListener("select", this.onSelect);
  };

  /** Place a sunflower when the screen is tapped. */
  // onSelect = () => {
  //   if (window.sunflower) {
  //     const clone = window.sunflower.clone();
  //     clone.position.copy(this.reticle.position);
  //     this.scene.add(clone)

  //     const shadowMesh = this.scene.children.find(c => c.name === 'shadowMesh');
  //     shadowMesh.position.y = clone.position.y;
  //   }
  // }

  arPlace = () => {
    if (window.sunflower && this.reticle.visible) {
      window.sunflower.position.setFromMatrixPosition(this.reticle.matrix);
      window.sunflower.visible = true;
      this.scene.add(window.sunflower);
      objShow = true;
      placed = true;
    }
  };

  rotateModel = () => {
    if (window.sunflower) {
      window.sunflower.rotation.y += 0.7;
      console.log("rotated");
    }
  };

  objToggle = () => {
    if (placed) {
      objShow = !objShow;
      window.sunflower.visible = objShow;
      if (objShow === true) {
        document.getElementById("obj-toggle").innerText = "Hide Product";
      } else if (objShow === false) {
        document.getElementById("obj-toggle").innerText = "Show Product";
      }
    }
  };

  retToggle = () => {
    retShow = !retShow;
    this.reticle.visible = retShow;
    if (retShow === true) {
      document.getElementById("ret-toggle").innerText = "Hide Marker";
    } else if (retShow === false) {
      document.getElementById("ret-toggle").innerText = "Show Marker";
    }
  };

  /**
   * Called on the XRSession's requestAnimationFrame.
   * Called with the time and XRPresentationFrame.
   */
  onXRFrame = (time, frame) => {
    // Queue up the next draw request.
    this.xrSession.requestAnimationFrame(this.onXRFrame);

    // Bind the graphics framebuffer to the baseLayer's framebuffer.
    const framebuffer = this.xrSession.renderState.baseLayer.framebuffer;
    this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, framebuffer);
    this.renderer.setFramebuffer(framebuffer);

    // Retrieve the pose of the device.
    // XRFrame.getViewerPose can return null while the session attempts to establish tracking.
    const pose = frame.getViewerPose(this.localReferenceSpace);
    if (pose) {
      // In mobile AR, we only have one view.
      const view = pose.views[0];

      const viewport = this.xrSession.renderState.baseLayer.getViewport(view);
      this.renderer.setSize(viewport.width, viewport.height);

      // Use the view's transform matrix and projection matrix to configure the THREE.camera.
      this.camera.matrix.fromArray(view.transform.matrix);
      this.camera.projectionMatrix.fromArray(view.projectionMatrix);
      this.camera.updateMatrixWorld(true);

      // Conduct hit test.
      const hitTestResults = frame.getHitTestResults(this.hitTestSource);

      // If we have results, consider the environment stabilized.
      if (!this.stabilized && hitTestResults.length > 0) {
        this.stabilized = true;
        document.body.classList.add("stabilized");
      }
      if (hitTestResults.length > 0) {
        const hitPose = hitTestResults[0].getPose(this.localReferenceSpace);

        // Update the reticle position

        if (retShow) {
          this.reticle.visible = true;
        }
        this.reticle.position.set(
          hitPose.transform.position.x,
          hitPose.transform.position.y,
          hitPose.transform.position.z
        );
        this.reticle.updateMatrixWorld(true);
      }

      // Render the scene with THREE.WebGLRenderer.
      this.renderer.render(this.scene, this.camera);
    }
  };

  /**
   * Initialize three.js specific rendering code, including a WebGLRenderer,
   * a demo scene, and a camera for viewing the 3D content.
   */
  setupThreeJs() {
    // To help with working with 3D on the web, we'll use three.js.
    // Set up the WebGLRenderer, which handles rendering to our session's base layer.
    this.renderer = new THREE.WebGLRenderer({
      alpha: true,
      preserveDrawingBuffer: true,
      canvas: this.canvas,
      context: this.gl,
    });
    this.renderer.autoClear = false;
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    // Initialize our demo scene.
    this.scene = DemoUtils.createLitScene();
    this.reticle = new Reticle();
    this.scene.add(this.reticle);

    // We'll update the camera matrices directly from API, so
    // disable matrix auto updates so three.js doesn't attempt
    // to handle the matrices independently.
    this.camera = new THREE.PerspectiveCamera();
    this.camera.matrixAutoUpdate = false;
  }
}
displayValues = Array(6);
class ProductDetails {
  constructor(
    n,
    d,
    p = ["-"],
    h = ["-"],
    c = ["-"],
    imglink = "",
    storelink = ""
  ) {
    this.title = n;
    this.price = p;
    this.height = h;
    this.colour = c;
    this.desc = d;
    this.image = imglink;
    this.index = 0;
    this.storelink = storelink;
  }
}

function productViewManager(e) {
  if (!isProductMenuOpen) {
    document.getElementById("expand").innerText = "zoom_in_map";
    showExpandedProduct();
  } else {
    document.getElementById("expand").innerText = "expand_content";
    hideExpandedProduct();
  }
  isProductMenuOpen = !isProductMenuOpen;
  fixProductMenuIconHeight();
}

function manageProductMenu(e) {
  if (isMenuOpen) {
    document.getElementById("product-menu-container").style.display = "none";
    document.getElementById("confirm-button").style.display = "none";
  } else {
    document.getElementById("product-menu-container").style.display = "grid";
    document.getElementById("close-menu").style.bottom =
      document.getElementById("product-menu-container").offsetHeight -
      50 +
      "px";
  }
  isMenuOpen = !isMenuOpen;
}

function productSelected() {
  //selectedProduct = sunflowerProduct;
  selectedProduct = candleProduct;
  document.getElementById("product-name-info").innerText =
    selectedProduct.title;
  document.getElementById("product-desc-info").innerText = selectedProduct.desc;
  setupFunction();
  manageProductMenu();
}

window.app = new App();
selectedProduct = null; //assume product class
productHidden = false;
markerHidden = false;
defaultProduct = new ProductDetails(
  "No product selected...",
  "Select a product by opening the product menu."
);
isProductMenuOpen = false; //this is actually expanded product, not product menu!
isMenuOpen = false;
sunflowerProduct = new ProductDetails(
  "Sunflower",
  "A regular synthetic sunflower that can point in any direction rather than always pointing towards the sun!",
  ["$25.00"],
  ['8"'],
  ["Yellow"],
  "https://upload.wikimedia.org/wikipedia/commons/4/40/Sunflower_sky_backdrop.jpg"
);
candleProduct = new ProductDetails(
  "Solid Beeswax Pillar Candle",
  "Made from 100% Alberta beeswax, our pillar candles are hand poured and show off the beautiful natural colouring of the wax. As they burn, the lovely, subtle scent of beeswax is released.",
  ["$20.00", "$31.00", "$42.00", "$53.00"],
  ['3"', '5"', '7"', '9"'],
  ["Stuart"],
  "https://i.imgur.com/kPO7HXN.jpg"
);
function fixProductMenuIconHeight() {
  value = document.getElementById("selection-panel").offsetHeight;
  document.getElementById("product-menu-icon-container").style.bottom =
    value + "px";
}

function setupFunction() {
  defaultProduct = new ProductDetails(
    "No product selected...",
    "Select a product by opening the product menu."
  );
  hideExpandedProduct(); //regular start
  if (selectedProduct == null) {
    document.getElementById("product-name-info").innerHTML =
      defaultProduct.title;
    document.getElementsByClassName("product-description")[0].innerHTML =
      defaultProduct.desc;
    document.getElementsByClassName("product-info")[0].style.display = "None";
    document.getElementById("image-selected").style.display = "none";
    document.getElementsByClassName("no-image")[0].style.display = "";
  } else {
    document.getElementById("product-name-info").innerHTML =
      selectedProduct.title;
    document.getElementsByClassName("product-description")[0].innerHTML =
      selectedProduct.desc.substr(0, 80) + "...";
    document.getElementById("open-product-menu").style.display = "None";
    document.getElementById("image-selected").src = selectedProduct.image;
    document.getElementById("image-selected").style.display = "";
    document.getElementsByClassName("no-image")[0].style.display = "none";
    updateProductDetailsOnExpandedCard();
  }
  fixProductMenuIconHeight();
}

function updateProductDetailsOnExpandedCard(idxChange = false) {
  $("#pc-price").attr("html", selectedProduct.price[selectedProduct.index]);
  document.getElementById("pc-height").innerHTML =
    selectedProduct.height[selectedProduct.index];
  document.getElementById("pc-colour").innerHTML = selectedProduct.colour[0];
  document.getElementById("fpc-price").innerHTML =
    selectedProduct.price[selectedProduct.index];
  if (!idxChange) $("#fpc-storelink").attr("href", selectedProduct.storelink);
  // colour??
  document.getElementById("#footer-height").innerHTML =
    selectedProduct.height[selectedProduct.index];
}

function changeIndex(value) {
  //tracks height and price
  selectedProduct.index = value.selectedIndex;
  // change price
  updateProductDetailsOnExpandedCard(true);
}

function sunflowerClicked() {
  document.getElementById("confirm-button").style.display = "";
}

function hideExpandedProduct() {
  elements = document.getElementsByClassName("show-for-fpc");
  if (selectedProduct != null) {
    document.getElementsByClassName("product-description")[0].innerHTML =
      selectedProduct.desc.substr(0, 85) + "...";
  }
  idx = 0;
  for (el of elements) {
    displayValues[idx] = el.style.display;
    el.style.display = "None";
    idx += 1;
  }

  if (selectedProduct != null) {
    document.getElementsByClassName("product-info")[0].style.display = "flex";
  }
}

function showExpandedProduct() {
  elements = document.getElementsByClassName("show-for-fpc");
  document.getElementById("product-desc-info").innerText = selectedProduct.desc;
  idx = 0;
  for (el of elements) {
    el.style.display = "";
    idx += 1;
  }
  document.getElementsByClassName("product-info")[0].style.display = "None";
}

function hideUnhideProduct() {
  if (productHidden) {
    //unhide product:
    //code to unhide
    document.getElementById("hide-marker").innerText = "Hide Product";
  } else {
    //code to hide it
    document.getElementById("hide-marker").innerText = "Unhide Product";
  }
  productHidden = !productHidden;
}

function hideUnhideMarker() {}
