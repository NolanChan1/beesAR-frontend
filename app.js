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
    loadProducts();
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
  constructor() {
    this.selected = null;
    this.current_obj = null;
    this.colour = { name: "", hexcode: "" };
    this.colourOption = false;
    this.changeCol = false;
    this.objAngle = 0;
  }

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
    const elementAR = document.getElementById("enter-ar");
    //element.remove();
    elementAR.style.display = "none";
    document.getElementById("btn-place").style.display = "unset";
    enteredAR = true;

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
      console.log("Place product button clicked");
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

  swapColour = () => {
    if (this.colourOption == true) {
      console.log("swapping colour");
      const model = this.current_obj;
      //apply colour
      console.log(
        "colour options available. colour chosen: " + this.colour.hexcode
      );
      // let material = new THREE.MeshBasicMaterial({ color: this.colour.hexcode });
      model.traverse((o) => {
        if (o.isMesh) {
          o.material.color.set(this.colour.hexcode);
          console.log("changed colour to: " + this.colour.name);
        }
      });
    }
  };

  setObject = (obj) => {
    this.current_obj = obj;
  };

  placeModel = (model) => {
    //  if(this.current_obj != model) {
    this.current_obj = model;
    if (this.colourOption == true) {
      //apply colour
      console.log(
        "colour options available. colour chosen: " + this.colour.hexcode
      );
      // let material = new THREE.MeshBasicMaterial({ color: this.colour.hexcode });
      model.traverse((o) => {
        if (o.isMesh) {
          o.material.color.set(this.colour.hexcode);
          console.log("changed colour to: " + this.colour.name);
        }
      });
    }
    //  }

    if (model && model != null && this.reticle.visible) {
      model.position.setFromMatrixPosition(this.reticle.matrix);
      model.visible = true;
      this.scene.add(model);
      objShow = true;
      placed = true;
    }
  };

  arPlace = () => {
    switch (this.selected) {
      case 2015:
        this.placeModel(window.candle[2015]);
        console.log("3″ Solid Beeswax Pillar Candle placed");
        break;
      case 644:
        this.placeModel(window.candle[644]);
        console.log("Beehive Rolled Beeswax Candle placed");
        break;
      case 629:
        this.placeModel(window.candle[629]);
        console.log("3″ Rolled Beeswax Pillar Candle placed");
        break;
      case 634:
        this.placeModel(window.candle[634]);
        //console.log("too much");
        console.log("Rolled Mini Taper Beeswax Candle placed");
        break;
      default:
        if (this.selected == null) {
          console.log("Nothing was selected");
        } else {
          //this.placeModel(window.sunflower);
          //console.log("sunflower placed");
          this.placeModel(window.candle[0]);
          console.log("Tin Candle placed");
        }
    }

    console.log("scene children array length: " + this.scene.children.length);
  };

  revertRotation = (angle) => {
    const oldAngle = (angle * Math.PI) / 180;
    this.objAngle = oldAngle;
    this.current_obj.rotation.y = oldAngle;
  };

  sliderRotate = (slider) => {
    console.log("rotating object.");
    const angle = (slider.value * Math.PI) / 180;
    this.current_obj.rotation.y = angle;
  };

  rotateModel = () => {
    if (this.current_obj) {
      this.current_obj.rotation.y += 0.7;
      console.log("rotated");
    }
  };

  objToggle = () => {
    if (placed) {
      objShow = !objShow;
      this.current_obj.visible = objShow;
      if (objShow === true) {
        $("#obj-toggle > span").text("Hide Product");
        $("#obj-toggle > img").attr(
          "src",
          "../assets/images/hide_projection_blue.png"
        );
        $("#obj-toggle").removeClass("value-p-highlighted");
        $("#obj-toggle").addClass("value-p-clickable");
      } else if (objShow === false) {
        $("#obj-toggle > span").text("Show Product");
        $("#obj-toggle > img").attr(
          "src",
          "../assets/images/hide_projection_white.png"
        );
        $("#obj-toggle").addClass("value-p-highlighted");
        $("#obj-toggle").removeClass("value-p-clickable");
      }
    }
  };

  retToggle = () => {
    retShow = !retShow;
    this.reticle.visible = retShow;
    if (retShow === true) {
      $("#ret-toggle > span").text("Hide Marker");
      $("#ret-toggle > img").attr(
        "src",
        "../assets/images/hide_virtualmarker_blue.png"
      );
      $("#ret-toggle").removeClass("value-p-highlighted");
      $("#ret-toggle").addClass("value-p-clickable");
    } else if (retShow === false) {
      $("#ret-toggle > span").text("Show Marker");
      $("#ret-toggle").addClass("value-p-highlighted");
      $("#ret-toggle").removeClass("value-p-clickable");
      $("#ret-toggle > img").attr(
        "src",
        "../assets/images/hide_virtualmarker_white.png"
      );
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
        retShow = true;
        console.log("stabilized! showing reticle");
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
    productSKU = -1,
    imageLink = "",
    name = "",
    description = "",
    prices = [],
    selectedPrice = -1,
    storeLink = "",
    heights = [],
    selectedHeight = -1,
    colours = [],
    selectedColour = { name: "", hexcode: "" },
    categories = [],
    diameter = -1
  ) {
    // this.title = n;
    // this.price = p;
    // this.height = h;
    // this.colour = c;
    // this.desc = d;
    // this.image = imglink;
    // this.index = 0;
    // this.storelink = storelink;

    this.productSKU = productSKU;
    this.imageLink = imageLink;
    this.name = name;
    this.description = description;
    this.prices = prices;
    this.selectedPrice = selectedPrice;
    this.storeLink = storeLink;
    this.heights = heights;
    this.selectedHeight = selectedHeight;
    this.colours = colours;
    this.selectedColour = selectedColour;
    this.categories = categories;
    this.diameter = diameter;
  }
}

function manageHeightDropdown(data) {
  if (selectedProduct.heights.length > 1) {
    if (
      $("#height-menu > .material-symbols-outlined").text() == "expand_more"
    ) {
      $("#height-menu > .material-symbols-outlined").html("expand_less");
      $("#height-menu-dropdown").css("display", "block");
    } else {
      $("#height-menu > .material-symbols-outlined").html("expand_more");
      $("#height-menu-dropdown").css("display", "none");
    }
  }
}

// function productViewManager(e) {
//   if (!isProductMenuOpen) {
//     document.getElementById("expand").innerText = "zoom_in_map";
//     showExpandedProduct();
//   } else {
//     document.getElementById("expand").innerText = "expand_content";
//     hideExpandedProduct();
//   }
//   isProductMenuOpen = !isProductMenuOpen;
//   fixProductMenuIconHeight();
// }

/** Expands and collapses card using helper functions */
function productViewManager(e) {
  if (selectedProduct) {
    if (!isProductMenuOpen) {
      document.getElementById("expand").innerText = "zoom_in_map";
      showExpandedProduct();
    } else if (isProductMenuOpen) {
      document.getElementById("expand").innerText = "expand_content";
      hideExpandedProduct();
    }
    isProductMenuOpen = !isProductMenuOpen;
    fixProductMenuIconHeight();
  }
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

function deleteProduct(selected) {
  const cur = window.app.current_obj;
  //remove object when the model is currently displayed
  //and when changing models (different SKUs)
  if (cur !== null && window.app.scene.children.length > 4) {
    //remove the currently selected product from scene
    //this will be the last element in the scene.children array
    //there's 5 elements when a object gets added.
    console.log("Removing Previous Object");
    let remove_obj = window.app.scene.children[4];
    window.app.scene.remove(remove_obj);
    placed = false;
    objShow = false;
    // window.app.current_obj = null;
  }
}

//parameters: sku and selectedColour hexcode
function swapProducts(selected, colour) {
  const cur = window.app.current_obj;
  let changeCol = false;
  if (window.app.selected == selected) {
    //same model
    //look for colour change
    if (
      window.app.colourOption == true &&
      window.app.colour.hexcode != colour
    ) {
      changeCol = true;
      //window.app.swapColour(cur);
      //swap colours
    }
  }

  window.app.changeCol = changeCol;
  // deleteProduct(selected);

  //remove object when the model is currently displayed
  //and when changing models (different SKUs)
  if (
    window.app.selected != selected &&
    cur !== null &&
    window.app.scene.children.length > 4
  ) {
    //remove the currently selected product from scene
    //this will be the last element in the scene.children array
    //there's 5 elements when a object gets added.
    console.log("Removing Previous Object");
    let remove_obj = window.app.scene.children[4];
    window.app.scene.remove(remove_obj);
    placed = false;
    objShow = false;
    // window.app.current_obj = null;
  }
}
/** Function called when a product is confirmed as selected in menu and card needs to be updated */
function productSelected(currentSelection) {
  //refactoring done
  //selectedProduct = sunflowerProduct;
  // selectedProduct = candleProduct;
  selectedProduct = new ProductDetails(
    currentSelection.productSKU,
    currentSelection.imageLink,
    currentSelection.name,
    currentSelection.description,
    currentSelection.prices,
    currentSelection.selectedPrice,
    currentSelection.storeLink,
    currentSelection.heights,
    currentSelection.selectedHeight,
    currentSelection.colours,
    currentSelection.selectedColour,
    currentSelection.categories,
    currentSelection.diameter
  );
  // selectedProduct.selectedIndex = 0; // for repeat selections
  // if(selectedProduct.productSKU != 2015 ||
  //   selectedProduct.productSKU != 644 ||
  //   selectedProduct.productSKU != 629 ||
  //   selectedProduct.productSKU != 634)
  //   {
  //     window.app.selected = 0;
  //   }
  // else
  //   {
  //     window.app.selected = selectedProduct.productSKU;
  //   }

  swapProducts(
    selectedProduct.productSKU,
    selectedProduct.selectedColour.hexcode
  );
  window.app.selected = selectedProduct.productSKU;

  if (selectedProduct.colours.length == 0) {
    console.log("colourOption=false");
    window.app.colourOption = false;
    window.app.colour = selectedProduct.selectedColour;
  } else if (selectedProduct.colours.length > 1) {
    console.log("colourOption=true. ");
    window.app.colourOption = true;
    window.app.colour = selectedProduct.selectedColour;
    if (window.app.colour == null) {
      window.app.colour = selectedProduct.colours[0];
      console.log("default colour: " + window.app.colour.name);
    }
  }

  if (window.app.changeCol == true) {
    window.app.swapColour();
  }

  document.getElementById("product-name-info").innerText = selectedProduct.name;
  document.getElementById("product-desc-info").innerText =
    selectedProduct.description;

  setupFunction();
  // manageProductMenu();
}

function undoSelectionOfProduct() {
  if (window.app.selected == null) {
    console.log("nothing was selected");
    return;
  }

  deleteProduct(selectedProduct.productSKU);
  selectedProduct = null;

  objShow = false;
  placed = false;
  window.app.current_obj = null;
  window.app.selected = null;
  console.log("deleting");

  if (retShow == false) {
    window.app.retToggle();
  }
  if (objShow == false) {
    $("#obj-toggle > span").text("Hide Product");
    $("#obj-toggle > img").attr(
      "src",
      "../assets/images/hide_projection_blue.png"
    );
    $("#obj-toggle").removeClass("value-p-highlighted");
    $("#obj-toggle").addClass("value-p-clickable");
  }
  setupFunction();
  productViewManager();
  pmcsProduct = {
    productSKU: -1,
    imageLink: "",
    name: "",
    description: "",
    prices: [],
    selectedPrice: -1,
    storeLink: "",
    heights: [],
    selectedHeight: -1,
    colours: [],
    selectedColour: { name: "", hexcode: "" },
    categories: [],
    diameter: -1,
  };
  updatePMCS();
}

window.app = new App();
listenersAdded = false;
selectedProduct = null; //assume product class
productHidden = false;
markerHidden = false;
defaultProduct = new ProductDetails(
  -1,
  "",
  "Please select a product to project onto the placed marker"
);
isProductMenuOpen = false; //this is actually expanded product, not product menu!
isMenuOpen = false;
// sunflowerProduct = new ProductDetails(
//   "Sunflower",
//   "A regular synthetic sunflower that can point in any direction rather than always pointing towards the sun!",
//   ["$25.00"],
//   ['8"'],
//   ["Yellow"],
//   "https://upload.wikimedia.org/wikipedia/commons/4/40/Sunflower_sky_backdrop.jpg"
// );
// candleProduct = new ProductDetails(
//   "Solid Beeswax Pillar Candle",
//   "Made from 100% Alberta beeswax, our pillar candles are hand poured and show off the beautiful natural colouring of the wax. As they burn, the lovely, subtle scent of beeswax is released.",
//   ["$20.00", "$31.00", "$42.00", "$53.00"],
//   ['3"', '5"', '7"', '9"'],
//   ["Stuart"],
//   "https://i.imgur.com/kPO7HXN.jpg"
// );

// the icon on the bottom right above product card
function fixProductMenuIconHeight() {
  value = document.getElementById("selection-panel").offsetHeight;
  document.getElementById("product-menu-icon-container").style.bottom =
    value + "px";
}

function updateColourRows() {
  if (selectedProduct.colours.length > 0) {
    $("#fpc-colour").html(pmpcProduct.selectedColour.name);

    let pmpcColourOption =
      '<div class="pmpc-colour-option-container"><div class="pmpc-colour-option-border"><div class="pmpc-colour-option-colour"></div></div><h1 class="pmpc-colour-option-text">default-colour</h1></div>';
    $.each(selectedProduct.colours, function (j, pmpcOption) {
      $(".colours").append(pmpcColourOption);

      if (j === colourIndex) {
        $(".colours div:nth-child(" + (j + 1) + ")")
          .children(".pmpc-colour-option-border")
          .addClass("pmpc-colour-option-border-selected");
        $(".colours div:nth-child(" + (j + 1) + ") h1").addClass(
          "pmpc-colour-option-text-selected"
        );
      }

      $(".colours div:nth-child(" + (j + 1) + ")")
        .children(".pmpc-colour-option-border")
        .children()
        .css("background-color", pmpcOption.hexcode);
      $(".colours div:nth-child(" + (j + 1) + ") h1").html(pmpcOption.name);

      $(".colours div:nth-child(" + (j + 1) + ")").on("click", function () {
        colourIndex = j;
        selectedProduct.selectedColour = selectedProduct.colours[colourIndex];
        window.app.colour = selectedProduct.selectedColour;
        window.app.swapColour();

        console.log(
          "In updateColourRows: " + selectedProduct.selectedColour.name
        );

        $("#pc-colour").html(selectedProduct.selectedColour.name);
        $("#fpc-colour").html(selectedProduct.selectedColour.name);
        $(".pmpc-colour-option-border-selected").removeClass(
          "pmpc-colour-option-border-selected"
        );
        $(".pmpc-colour-option-text-selected").removeClass(
          "pmpc-colour-option-text-selected"
        );
        $(".colours div:nth-child(" + (colourIndex + 1) + ")")
          .children(".pmpc-colour-option-border")
          .addClass("pmpc-colour-option-border-selected");
        $(".colours div:nth-child(" + (colourIndex + 1) + ") h1").addClass(
          "pmpc-colour-option-text-selected"
        );
      });
    });
  }
}
/** Primary onload function that sets up UI elements on page load. This is also reused to update product card details! */
function setupFunction() {
  if (!listenersAdded) {
    listenersAdded = true;
    $("#product-modal-button").on("click", function (evn) {
      if (selectedProduct != null) {
        $("#ProductModal").modal("show");
      }
    });
  }
  hideExpandedProduct(); //regular start
  if (selectedProduct == null) {
    document.getElementById("product-name-info").innerHTML =
      defaultProduct.name;
    document.getElementsByClassName("product-description")[0].innerHTML =
      defaultProduct.description;
    document.getElementById("open-product-menu").style.display = "";
    document.getElementsByClassName("product-info")[0].style.display = "None";
    document.getElementById("image-selected").style.display = "none";
    document.getElementsByClassName("no-image")[0].style.display = "";
  } else {
    document.getElementById("product-name-info").innerHTML =
      selectedProduct.name;
    document.getElementsByClassName("product-description")[0].innerHTML =
      selectedProduct.description;
    document.getElementById("open-product-menu").style.display = "None";
    document.getElementById("image-selected").src = selectedProduct.imageLink;
    document.getElementById("image-selected").style.display = "";
    document.getElementsByClassName("no-image")[0].style.display = "none";
    updateProductDetailsOnExpandedCard();
  }
  fixProductMenuIconHeight();
}

function updateProductDetailsOnExpandedCard(idxChange = false) {
  document.getElementById("pc-price").innerHTML =
    "$" + selectedProduct.selectedPrice; //backend should store the decimals
  document.getElementById("pc-height").innerHTML =
    selectedProduct.selectedHeight + '"';
  document.getElementById("pc-colour").innerHTML =
    selectedProduct.colours.length == 0
      ? "N/A"
      : selectedProduct.selectedColour.name;
  document.getElementById("fpc-price").innerHTML =
    "$" + selectedProduct.selectedPrice;
  if (!idxChange) $("#fpc-storelink").attr("href", selectedProduct.storeLink);
  // colour
  $(".colours").empty();
  if (selectedProduct.colours.length > 0) updateColourRows();
  else $("#fpc-colour").html("No colour options");

  $("#height-menu-dropdown").empty();
  $(".height-text").text(selectedProduct.selectedHeight + '"');
  $("#height-menu > .material-symbols-outlined").removeClass("hide");
  if (selectedProduct.heights.length <= 1)
    $("#height-menu > .material-symbols-outlined").addClass("hide");
  selectedProduct.heights.forEach((height, index) => {
    if (height != selectedProduct.selectedHeight)
      $("#height-menu-dropdown").append(
        `<li class='value-p' role='option' onclick='changeIndex(this)'>${height}"</li>`
      );
    else
      $("#height-menu-dropdown").append(
        `<li class='value-p height-selected' role='option' onclick='changeIndex(this)'>${height}"</li>`
      );
  });
  $("#category-container > .value-p").remove();
  selectedProduct.categories.forEach((category) => {
    $("#category-container").append(`<span class="value-p">${category}</span>`);
  });

  document.getElementById("footer-height").innerText =
    selectedProduct.selectedHeight + '"';
  if (selectedProduct.diameter != -1) {
    $(".footer-width-text").text(selectedProduct.diameter + '"');
    $(".footer-width").removeClass("hide");
  } else $(".footer-width").addClass("hide");
}
/** Deals with change in height selected and corresponding price */
function changeIndex(node) {
  //tracks height and price
  selectedProduct.selectedHeight = parseInt(node.innerText.slice(0, -1));
  selectedProduct.selectedPrice =
    selectedProduct.prices[
      selectedProduct.heights.indexOf(selectedProduct.selectedHeight)
    ];
  // change price
  manageHeightDropdown(); //close it after height selection
  updateProductDetailsOnExpandedCard(true);
}

function sunflowerClicked() {
  document.getElementById("confirm-button").style.display = "";
}

function hideExpandedProduct() {
  elements = document.getElementsByClassName("show-for-fpc");
  document.getElementById("expand").innerText = "expand_content";
  if (selectedProduct != null) {
    document.getElementsByClassName("product-description")[0].innerHTML =
      selectedProduct.description.length > 103
        ? selectedProduct.description.substr(0, 103) + "..."
        : selectedProduct.description;
    $("#product-desc-info").addClass("collapsed-card");
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
  document.getElementById("expand").innerText = "zoom_in_map";
  // document.getElementById("product-desc-info").innerText = selectedProduct.description;
  $("#product-desc-info").removeClass("collapsed-card");
  idx = 0;
  for (el of elements) {
    el.style.display = "";
    idx += 1;
  }
  document.getElementsByClassName("product-info")[0].style.display = "None";
  // window.app.swapColour(pmpcProduct.selectedColour);
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

function rotateSelection() {
  if (!placed || !objShow) {
    console.log("Product needs to be placed and displayed to rotate");
    return false;
  }
  productViewManager();
  $("#enter-ar").addClass("hide");
  $("#rotation-slider-container").removeClass("hide");
  const slider = document.getElementById("rotation-slider");
  slider.addEventListener("input", function () {
    window.app.sliderRotate(slider);
  });
  return false;
}
/** Cancels rotation and returns to product card */
function stopRotation() {
  // Hide/show virtual marker needs to be decided based on whether marker is placed.
  const angle = window.app.objAngle;
  productViewManager();
  finishRotation();
  window.app.revertRotation(angle);
  document.getElementById("rotation-slider").value = angle;
}
/** Helper function to manage UI elements after rotation */
function finishRotation() {
  $("#enter-ar").removeClass("hide");
  $("#rotation-slider-container").addClass("hide");
  window.app.objAngle = document.getElementById("rotation-slider").value;
}

// PRODUCT MENU CODE

// Fetches products by one product category (productCategory)
async function fetchCategory(productCategory) {
  let fetchedData;
  await fetch(`https://beesar-backend.com/api/categories/${productCategory}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  })
    .then((response) => {
      return response.json();
    })
    .then((data) => {
      fetchedData = data;
    })
    .catch((error) => {
      console.error("PRODUCT CATEGORY FETCH ERROR: ", error);
    });
  return fetchedData;
}

// Fetches the URL of an image for the specified product (productSKU)
async function fetchImage(productSKU) {
  let imageLink;
  await fetch(`https://beesar-backend.com/api/product_images/${productSKU}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  })
    .then((response) => {
      return response.text();
    })
    .then((data) => {
      imageLink = data;
    })
    .catch((error) => {
      console.error("IMAGE FETCH ERROR: ", error);
    });
  return imageLink;
}

// Fetches products from the backend based on the categories selected in candleCategories
// Returns a Promise with an array with all of the results
async function fetchCategories() {
  let fetchResult = [];
  if (candleCategories[0].selected) {
    // If 'All' category is selected
    await fetch(`https://beesar-backend.com/api/products`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    })
      .then((response) => {
        return response.json();
      })
      .then((data) => {
        fetchResult = fetchResult.concat(data);
      })
      .catch((error) => {
        console.error("ALL PRODUCT FETCH ERROR: ", error);
      });
  } else {
    // If 'All' category is not selected
    for (let k = 1; k < candleCategories.length; k++) {
      if (candleCategories[k].selected) {
        await fetch(
          `https://beesar-backend.com/api/categories/${candleCategories[k].reqName}`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
            },
          }
        )
          .then((response) => {
            return response.json();
          })
          .then((data) => {
            fetchResult = fetchResult.concat(data);
          })
          .catch((error) => {
            console.error("CATEGORIZED PRODUCT FETCH ERROR: ", error);
          });
      }
    }
  }

  return fetchResult;
}

// Fetches products from the backend by the name (searchTerm)
async function fetchByName(searchTerm) {
  const fetchURI = `https://beesar-backend.com/api/products/name/${searchTerm}`;
  let fetchResult = [];

  await fetch(encodeURI(fetchURI), {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  })
    .then((response) => {
      return response.json();
    })
    .then((data) => {
      fetchResult = data;
    })
    .catch((error) => {
      console.error("NAMED PRODUCT FETCH ERROR: ", error);
    });

  return fetchResult;
}

// Product menu dropdown data
let menuTypes = [
  {
    id: 1,
    name: "Default product menu",
    icon: "mdi:book-open",
    class: ".dpm-container",
  },
  {
    id: 2,
    name: "Search for products by category",
    icon: "material-symbols:category-outline-rounded",
    class: ".spm-category",
  },
  {
    id: 3,
    name: "Search for products by name",
    icon: "material-symbols:search-rounded",
    class: ".spm-name",
  },
];
let selectedMenuType = menuTypes[0];
let menuDropdownOpen = false;

// Product menu product card data
let pmpcProduct = {
  productSKU: -1,
  imageLink: "",
  name: "",
  description: "",
  prices: [],
  selectedPrice: -1,
  storeLink: "",
  heights: [],
  selectedHeight: -1,
  colours: [],
  selectedColour: { name: "", hexcode: "" },
  categories: [],
  diameter: -1,
};
let pmpcDropdownOpen = false;
let heightIndex = 0;
let colourIndex = 0;

// Product menu current selection data
let pmcsProduct = {
  productSKU: -1,
  imageLink: "",
  name: "",
  description: "",
  prices: [],
  selectedPrice: -1,
  storeLink: "",
  heights: [],
  selectedHeight: -1,
  colours: [],
  selectedColour: { name: "", hexcode: "" },
  categories: [],
  diameter: -1,
};

// PM Category Search data
let candleCategories = [
  {
    id: 0,
    name: "All",
    reqName: "",
    buttonWidth: "2.25rem",
    selected: false,
  },
  {
    id: 1,
    name: "Pillars",
    reqName: "pillars",
    buttonWidth: "4.5rem",
    selected: false,
  },
  {
    id: 2,
    name: "Specialty",
    reqName: "specialty",
    buttonWidth: "4.5rem",
    selected: false,
  },
  {
    id: 3,
    name: "Tealights",
    reqName: "tealights",
    buttonWidth: "4.5rem",
    selected: false,
  },
  {
    id: 4,
    name: "Tapers",
    reqName: "tapers",
    buttonWidth: "4.5rem",
    selected: false,
  },
  {
    id: 5,
    name: "Votives",
    reqName: "votives",
    buttonWidth: "4.5rem",
    selected: false,
  },
];

let pmCategorySearchResults = [];

// PM Name Search data

let pmNameSearchTerm = "";
let pmNameSearchResults = [];

// Update the styles for the product menu dropdown menu styles (selecting different menus)
function updatePMDropdownStyles() {
  if (menuDropdownOpen) {
    $(".pm-dropdown-button-arrow").removeAttr("flip");
    $(".pm-dropdown-list").css("display", "block");
  } else {
    $(".pm-dropdown-button-arrow").attr("flip", "vertical");
    $(".pm-dropdown-list").css("display", "none");
  }
}

// Update the dropdown menu styles in the product menu product card
function updatePMPCDDStyles() {
  if (pmpcDropdownOpen) {
    $(".pmpc-dropdown-button-icon").removeAttr("flip");
    $(".pmpc-dropdown-list").css("display", "block");

    $(".pmpc-dropdown-button").addClass("pmpc-remove-bottom-radius");
    $(".pmpc-dropdown-button").addClass("pmpc-dropdown-shadow");
  } else {
    $(".pmpc-dropdown-button-icon").attr("flip", "vertical");
    $(".pmpc-dropdown-list").css("display", "none");

    $(".pmpc-dropdown-button").removeClass("pmpc-remove-bottom-radius");
    $(".pmpc-dropdown-button").removeClass("pmpc-dropdown-shadow");
  }
}

// Update the product menu product card
// Intended to run everytime a user presses a product in the product menu
function updatePMPC() {
  $(".pmpc-product-image").attr("src", pmpcProduct.imageLink);
  $(".pmpc-header-text-container h1").html(pmpcProduct.name);
  $(".pmpc-header-text-container p").html(pmpcProduct.description);
  $(".pmpc-price").html("$" + pmpcProduct.selectedPrice);
  $(".pmpc-store-redirect-button a").attr("href", pmpcProduct.storeLink);

  $(".pmpc-height").html(pmpcProduct.selectedHeight + '"');
  $(".pmpc-dropdown-list").empty();
  if (pmpcProduct.heights.length > 1) {
    $(".pmpc-single-height").css("display", "none");
    $(".pmpc-dropdown-container").css("display", "block");
    updatePMPCDDStyles(pmpcDropdownOpen);

    $(".pmpc-dropdown-button").off();
    $(".pmpc-dropdown-button").on("click", function () {
      pmpcDropdownOpen = !pmpcDropdownOpen;
      updatePMPCDDStyles(pmpcDropdownOpen);
    });

    let pmpcDropdownOption =
      '<li class="pmpc-list-option pmpc-dropdown-shadow" role="option">0"</li>';
    $.each(pmpcProduct.heights, function (j, pmpcOption) {
      $(".pmpc-dropdown-list").append(pmpcDropdownOption);

      $(".pmpc-dropdown-list li:nth-child(" + (j + 1) + ")").html(
        pmpcOption + '"'
      );
      $(".pmpc-dropdown-list li:nth-child(" + (j + 1) + ")").on(
        "click",
        function () {
          heightIndex = j;

          pmpcProduct.selectedPrice = pmpcProduct.prices[heightIndex];
          pmpcProduct.selectedHeight = pmpcProduct.heights[heightIndex];
          $(".pmpc-price").html("$" + pmpcProduct.selectedPrice);
          $(".pmpc-height").html(pmpcProduct.selectedHeight + '"');

          $(".pmpc-selected-option").removeClass("pmpc-selected-option");
          $(".pmpc-dropdown-list li:nth-child(" + (j + 1) + ")").addClass(
            "pmpc-selected-option"
          );

          pmpcDropdownOpen = false;
          updatePMPCDDStyles(pmpcDropdownOpen);
        }
      );
    });

    $(".pmpc-dropdown-list li:nth-child(" + (heightIndex + 1) + ")").addClass(
      "pmpc-selected-option"
    );
  } else {
    $(".pmpc-single-height").css("display", "block");
    $(".pmpc-dropdown-container").css("display", "none");
  }

  $(".pmpc-colour-row-container").empty();
  if (pmpcProduct.colours.length > 0) {
    $(".pmpc-colour").html(pmpcProduct.selectedColour.name);

    let pmpcColourOption =
      '<div class="pmpc-colour-option-container"><div class="pmpc-colour-option-border"><div class="pmpc-colour-option-colour"></div></div><h1 class="pmpc-colour-option-text">default-colour</h1></div>';
    $.each(pmpcProduct.colours, function (j, pmpcOption) {
      $(".pmpc-colour-row-container").append(pmpcColourOption);

      if (j === colourIndex) {
        $(".pmpc-colour-row-container div:nth-child(" + (j + 1) + ")")
          .children(".pmpc-colour-option-border")
          .addClass("pmpc-colour-option-border-selected");
        $(
          ".pmpc-colour-row-container div:nth-child(" + (j + 1) + ") h1"
        ).addClass("pmpc-colour-option-text-selected");
      }

      $(".pmpc-colour-row-container div:nth-child(" + (j + 1) + ")")
        .children(".pmpc-colour-option-border")
        .children()
        .css("background-color", pmpcOption.hexcode);
      $(".pmpc-colour-row-container div:nth-child(" + (j + 1) + ") h1").html(
        pmpcOption.name
      );

      $(".pmpc-colour-row-container div:nth-child(" + (j + 1) + ")").on(
        "click",
        function () {
          colourIndex = j;
          pmpcProduct.selectedColour = pmpcProduct.colours[colourIndex];

          $(".pmpc-colour").html(pmpcProduct.selectedColour.name);
          $(".pmpc-colour-option-border-selected").removeClass(
            "pmpc-colour-option-border-selected"
          );
          $(".pmpc-colour-option-text-selected").removeClass(
            "pmpc-colour-option-text-selected"
          );
          $(
            ".pmpc-colour-row-container div:nth-child(" +
              (colourIndex + 1) +
              ")"
          )
            .children(".pmpc-colour-option-border")
            .addClass("pmpc-colour-option-border-selected");
          $(
            ".pmpc-colour-row-container div:nth-child(" +
              (colourIndex + 1) +
              ") h1"
          ).addClass("pmpc-colour-option-text-selected");
        }
      );
    });
  } else {
    $(".pmpc-colour").html("No colour options");
  }

  $(".pmpc-categories").empty();
  let pmpcCategoryOption = '<p class="pmpc-attribute-height">';
  $.each(pmpcProduct.categories, function (j, pmpcOption) {
    $(".pmpc-categories").append(pmpcCategoryOption + pmpcOption + "</p>");
  });

  if (pmpcProduct.diameter === -1) {
    $(".pmpc-diameter").css("display", "none");
  } else {
    $(".pmpc-diameter").css("display", "flex");
    $(".pmpc-diameter p").html(pmpcProduct.diameter + '"');
  }

  $(".pmpc-go-back-button").off();
  $(".pmpc-swap-button").off();
  $(".pmpc-go-back-button").on("click", function () {
    $(".pmpc-background-dim").css("display", "none");
    $(".pmpc-container").css("display", "none");
  });
  $(".pmpc-swap-button").on("click", function () {
    $(".pmpc-background-dim").css("display", "none");
    $(".pmpc-container").css("display", "none");

    pmcsProduct = pmpcProduct;
    updatePMCS();

    // CODE TO UPDATE PRODUCT CARD HERE
    productSelected(pmcsProduct);
  });

  // Make PMPC visible
  $(".pmpc-background-dim").css("display", "block");
  $(".pmpc-container").css("display", "block");
}

// Update the current selection section in the product menu
function updatePMCS() {
  if (pmcsProduct.productSKU === -1) {
    $(".pm-cs-image").attr("src", "../assets/images/no-selection-picture.png");
    $(".pm-cs-image").css("border-color", "#adb5bd");

    $(".pm-cs-noselection").css("display", "block");
    $(".pm-cs-selection").css("display", "none");
  } else {
    $(".pm-cs-image").attr("src", pmcsProduct.imageLink);
    $(".pm-cs-image").css("border-color", "#33415c");

    $(".pm-cs-noselection").css("display", "none");
    $(".pm-cs-selection").css("display", "block");

    $(".pm-cs-selection h2").html(pmcsProduct.name);
    $(".pm-cs-price").html("$" + pmcsProduct.selectedPrice);
    $(".pm-cs-height").html(pmcsProduct.selectedHeight + '"');
    if (pmcsProduct.colours.length > 0) {
      $(".pm-cs-colour").html(pmcsProduct.selectedColour.name);
    } else {
      $(".pm-cs-colour").html("N/A");
    }
    $(".pm-cs-description").html(pmcsProduct.description);
  }
}

// Update the product category button styles in the search by category menu
function updateCategoryButtons() {
  $(".spm-category-button-selected").removeClass(
    "spm-category-button-selected"
  );
  $.each(candleCategories, function (j, candleCat) {
    if (candleCat.selected) {
      $(
        ".spm-category-buttton-container button:nth-child(" + (j + 1) + ")"
      ).addClass("spm-category-button-selected");
    }
  });
}

// Setup search by category menu
function setupCategorySearchPM() {
  let pmCategorySearchOption =
    '<button class="spm-category-button">default-category</button>';

  // Add category buttons
  $.each(candleCategories, function (i, candleCategory) {
    $(".spm-category-buttton-container").append(pmCategorySearchOption);
    $(".spm-category-buttton-container button:nth-child(" + (i + 1) + ")").html(
      candleCategory.name
    );
    $(".spm-category-buttton-container button:nth-child(" + (i + 1) + ")").css(
      "width",
      candleCategory.buttonWidth
    );

    $(".spm-category-buttton-container button:nth-child(" + (i + 1) + ")").on(
      "click",
      function () {
        if (candleCategories[i].id === 0) {
          if (!candleCategories[i].selected) {
            // Select "All" and unselect the other buttons
            candleCategories[i].selected = true;
            for (let j = 1; j < candleCategories.length; j++) {
              candleCategories[j].selected = false;
            }
          } else {
            candleCategories[i].selected = false;
          }
        } else {
          // Unselect "All" if a different category is selected
          if (candleCategories[0].selected) {
            candleCategories[0].selected = false;
          }

          candleCategories[i].selected = !candleCategories[i].selected;
        }
        updateCategoryButtons();

        let fetchRes = fetchCategories();
        fetchRes.then((fetchedData) => {
          pmCategorySearchResults = fetchedData;

          // Empty container and append search results
          $(".spm-category-search").empty();
          if (pmCategorySearchResults.length > 0) {
            $(".spm-nocategory-search").css("display", "none");
            $(".spm-category-search").css("display", "flex");

            let pmOption =
              '<div class="pm-product-container spm-product-container"><img src="../assets/images/no-selection-picture.png" alt="default-product-image" width="84" height="84" class="pm-product-image"/><h3>default-name</h3></div>';

            $.each(pmCategorySearchResults, function (m, data) {
              $(".spm-category-search").append(pmOption);

              let imageLink = fetchImage(data.Product_SKU);
              imageLink.then((link) => {
                $(
                  ".spm-category-search div:nth-child(" + (m + 1) + ") img"
                ).attr("src", link);
              });
              $(".spm-category-search div:nth-child(" + (m + 1) + ") h3").html(
                data.Name
              );

              // Handle on click event - Setup PMPC
              $(".spm-category-search div:nth-child(" + (m + 1) + ")").on(
                "click",
                function () {
                  heightIndex = 0;
                  colourIndex = 0;

                  pmpcProduct.productSKU = data.Product_SKU;
                  pmpcProduct.imageLink = $(
                    ".spm-category-search div:nth-child(" + (m + 1) + ") img"
                  ).attr("src");
                  pmpcProduct.name = data.Name;
                  pmpcProduct.description = data.Description;
                  pmpcProduct.prices = data.Price;
                  pmpcProduct.selectedPrice = pmpcProduct.prices[heightIndex];
                  pmpcProduct.storeLink = data["Product Page Link"];
                  pmpcProduct.heights = data.Dimensions.Height;
                  pmpcProduct.selectedHeight = pmpcProduct.heights[heightIndex];
                  if ("Color Options" in data) {
                    pmpcProduct.colours = data["Color Options"];
                    pmpcProduct.selectedColour =
                      pmpcProduct.colours[colourIndex];
                  } else {
                    pmpcProduct.colours = [];
                    pmpcProduct.selectedColour = { name: "", hexcode: "" };
                  }
                  pmpcProduct.categories = data.Category;
                  if ("Diameter" in data.Dimensions) {
                    pmpcProduct.diameter = data.Dimensions.Diameter;
                  } else {
                    pmpcProduct.diameter = -1;
                  }

                  updatePMPC();
                }
              );
            });
          } else {
            $(".spm-nocategory-search").css("display", "flex");
            $(".spm-category-search").css("display", "none");
          }
        });
      }
    );
  });

  updateCategoryButtons();
}

// Function for directing to search by category menu
// Intended for the View Category buttons in the default menu
function goToCategorySearch(categoryID) {
  // Set selected menu type
  selectedMenuType = menuTypes[1];

  // Update PM dropdown button
  $(".pm-dropdown-button-icon").attr("icon", selectedMenuType.icon);
  $(".pm-dropdown-button-text").html(selectedMenuType.name);

  // Update PM dropdown list styles
  $.each(menuTypes, function (j, mType) {
    if (selectedMenuType.id === mType.id) {
      $(".pm-dropdown-list li:nth-child(" + (j + 1) + ")").css(
        "background-color",
        "#0466c8"
      );
      $(".pm-dropdown-list li:nth-child(" + (j + 1) + ") iconify-icon").attr(
        "style",
        "color: #e9ecef"
      );
      $(".pm-dropdown-list li:nth-child(" + (j + 1) + ") p").css(
        "color",
        "#e9ecef"
      );
    } else {
      $(".pm-dropdown-list li:nth-child(" + (j + 1) + ")").css(
        "background-color",
        "#dee2e6"
      );
      $(".pm-dropdown-list li:nth-child(" + (j + 1) + ") iconify-icon").attr(
        "style",
        "color: #0353a4"
      );
      $(".pm-dropdown-list li:nth-child(" + (j + 1) + ") p").css(
        "color",
        "#0353a4"
      );
    }
  });

  $(".dpm-container").css("display", "none");
  $(".spm-category").css("display", "block");
  $(".spm-name").css("display", "none");

  // Select category
  for (let j = 0; j < candleCategories.length; j++) {
    if (candleCategories[j].id === categoryID) {
      candleCategories[j].selected = true;
    } else {
      candleCategories[j].selected = false;
    }
  }
  updateCategoryButtons();

  // Fetch results
  let fetchRes = fetchCategories();
  fetchRes.then((fetchedData) => {
    pmCategorySearchResults = fetchedData;

    $(".spm-category-search").empty();
    if (pmCategorySearchResults.length > 0) {
      $(".spm-nocategory-search").css("display", "none");
      $(".spm-category-search").css("display", "flex");

      let pmOption =
        '<div class="pm-product-container spm-product-container"><img src="../assets/images/no-selection-picture.png" alt="default-product-image" width="84" height="84" class="pm-product-image"/><h3>default-name</h3></div>';

      $.each(pmCategorySearchResults, function (m, data) {
        $(".spm-category-search").append(pmOption);

        let imageLink = fetchImage(data.Product_SKU);
        imageLink.then((link) => {
          $(".spm-category-search div:nth-child(" + (m + 1) + ") img").attr(
            "src",
            link
          );
        });
        $(".spm-category-search div:nth-child(" + (m + 1) + ") h3").html(
          data.Name
        );

        // Handle on click event - Setup PMPC
        $(".spm-category-search div:nth-child(" + (m + 1) + ")").on(
          "click",
          function () {
            heightIndex = 0;
            colourIndex = 0;

            pmpcProduct.productSKU = data.Product_SKU;
            pmpcProduct.imageLink = $(
              ".spm-category-search div:nth-child(" + (m + 1) + ") img"
            ).attr("src");
            pmpcProduct.name = data.Name;
            pmpcProduct.description = data.Description;
            pmpcProduct.prices = data.Price;
            pmpcProduct.selectedPrice = pmpcProduct.prices[heightIndex];
            pmpcProduct.storeLink = data["Product Page Link"];
            pmpcProduct.heights = data.Dimensions.Height;
            pmpcProduct.selectedHeight = pmpcProduct.heights[heightIndex];
            if ("Color Options" in data) {
              pmpcProduct.colours = data["Color Options"];
              pmpcProduct.selectedColour = pmpcProduct.colours[colourIndex];
            } else {
              pmpcProduct.colours = [];
              pmpcProduct.selectedColour = { name: "", hexcode: "" };
            }
            pmpcProduct.categories = data.Category;
            if ("Diameter" in data.Dimensions) {
              pmpcProduct.diameter = data.Dimensions.Diameter;
            } else {
              pmpcProduct.diameter = -1;
            }

            updatePMPC();
          }
        );
      });
    } else {
      $(".spm-nocategory-search").css("display", "flex");
      $(".spm-category-search").css("display", "none");
    }
  });
}

// Update text input in search by name product menu
function updateNameSearchPM() {
  if (pmNameSearchTerm.length > 0) {
    $(".spm-cancelsearch-button").css("display", "block");
  } else {
    $(".spm-cancelsearch-button").css("display", "none");
  }
}

// Setup the search by name product menu
function setupNameSearchPM() {
  updateNameSearchPM();
  $(".spm-search-input").keyup(function (val) {
    pmNameSearchTerm = val.target.value;

    updateNameSearchPM();
  });

  $(".spm-cancelsearch-button").on("click", function () {
    $(".spm-search-input").val("");
    pmNameSearchTerm = "";

    updateNameSearchPM();
  });

  $(".spm-search-button").on("click", function () {
    let fetchRes = fetchByName(pmNameSearchTerm);
    fetchRes.then((fetchedData) => {
      pmNameSearchResults = fetchedData;

      $(".spm-name-search").empty();
      if (pmNameSearchResults.length > 0) {
        $(".spm-noname-search").css("display", "none");
        $(".spm-name-search").css("display", "flex");

        let pmOption =
          '<div class="pm-product-container spm-product-container"><img src="../assets/images/no-selection-picture.png" alt="default-product-image" width="84" height="84" class="pm-product-image"/><h3>default-name</h3></div>';

        $.each(pmNameSearchResults, function (m, data) {
          $(".spm-name-search").append(pmOption);

          let imageLink = fetchImage(data.Product_SKU);
          imageLink.then((link) => {
            $(".spm-name-search div:nth-child(" + (m + 1) + ") img").attr(
              "src",
              link
            );
          });
          $(".spm-name-search div:nth-child(" + (m + 1) + ") h3").html(
            data.Name
          );

          // Handle on click event - Setup PMPC
          $(".spm-name-search div:nth-child(" + (m + 1) + ")").on(
            "click",
            function () {
              heightIndex = 0;
              colourIndex = 0;

              pmpcProduct.productSKU = data.Product_SKU;
              pmpcProduct.imageLink = $(
                ".spm-name-search div:nth-child(" + (m + 1) + ") img"
              ).attr("src");
              pmpcProduct.name = data.Name;
              pmpcProduct.description = data.Description;
              pmpcProduct.prices = data.Price;
              pmpcProduct.selectedPrice = pmpcProduct.prices[heightIndex];
              pmpcProduct.storeLink = data["Product Page Link"];
              pmpcProduct.heights = data.Dimensions.Height;
              pmpcProduct.selectedHeight = pmpcProduct.heights[heightIndex];
              if ("Color Options" in data) {
                pmpcProduct.colours = data["Color Options"];
                pmpcProduct.selectedColour = pmpcProduct.colours[colourIndex];
              } else {
                pmpcProduct.colours = [];
                pmpcProduct.selectedColour = { name: "", hexcode: "" };
              }
              pmpcProduct.categories = data.Category;
              if ("Diameter" in data.Dimensions) {
                pmpcProduct.diameter = data.Dimensions.Diameter;
              } else {
                pmpcProduct.diameter = -1;
              }

              updatePMPC();
            }
          );
        });
      } else {
        $(".spm-noname-search").css("display", "flex");
        $(".spm-name-search").css("display", "none");
      }
    });
  });
}

// Run function to setup Product Menu
function setupPM() {
  $(document).ready(function () {
    // Setup open PM button
    $(".open-pm-button").on("click", function () {
      $(".pm-container").animate({ bottom: 0 });
      $(".pm-background-dim").animate({ opacity: 0.5 });
      $(".pm-background-dim").css("display", "block");
    });

    // Setup close PM button
    $(".close-pm-button-container").on("click", function () {
      $(".pm-container").animate({ bottom: "-100vh" });
      $(".pm-background-dim").animate({ opacity: 0 });
      $(".pm-background-dim").css("display", "none");
    });

    updatePMCS();

    // Setup PM dropdown button
    $(".pm-dropdown-button-icon").attr("icon", selectedMenuType.icon);
    $(".pm-dropdown-button-text").html(selectedMenuType.name);
    updatePMDropdownStyles();
    $(".pm-dropdown-button").on("click", function () {
      menuDropdownOpen = !menuDropdownOpen;
      updatePMDropdownStyles();
    });

    // Populate PM dropdown list
    let dropdownOption =
      '<li class="pm-dropdown-option-container"><iconify-icon icon="mdi:book-open" width="16" inline="true" style="color: #0353a4"></iconify-icon><p>menu-selection</p></li>';

    $.each(menuTypes, function (i, type) {
      $(".pm-dropdown-list").append(dropdownOption);
      $(".pm-dropdown-list li:nth-child(" + (i + 1) + ") iconify-icon").attr(
        "icon",
        type.icon
      );
      $(".pm-dropdown-list li:nth-child(" + (i + 1) + ") p").html(type.name);

      // Setup PM dropdown list selected option styles
      if (selectedMenuType.id === type.id) {
        $(".pm-dropdown-list li:nth-child(" + (i + 1) + ")").css(
          "background-color",
          "#0466c8"
        );
        $(".pm-dropdown-list li:nth-child(" + (i + 1) + ") iconify-icon").attr(
          "style",
          "color: #e9ecef"
        );
        $(".pm-dropdown-list li:nth-child(" + (i + 1) + ") p").css(
          "color",
          "#e9ecef"
        );
      } else {
        $(".pm-dropdown-list li:nth-child(" + (i + 1) + ")").css(
          "background-color",
          "#dee2e6"
        );
        $(".pm-dropdown-list li:nth-child(" + (i + 1) + ") iconify-icon").attr(
          "style",
          "color: #0353a4"
        );
        $(".pm-dropdown-list li:nth-child(" + (i + 1) + ") p").css(
          "color",
          "#0353a4"
        );
      }

      // Add onClick events
      $(".pm-dropdown-list li:nth-child(" + (i + 1) + ")").on(
        "click",
        function () {
          // Set selected menu type
          selectedMenuType = menuTypes[i];

          // Update PM dropdown button
          $(".pm-dropdown-button-icon").attr("icon", selectedMenuType.icon);
          $(".pm-dropdown-button-text").html(selectedMenuType.name);

          // Update PM dropdown list styles
          $.each(menuTypes, function (j, mType) {
            if (selectedMenuType.id === mType.id) {
              $(".pm-dropdown-list li:nth-child(" + (j + 1) + ")").css(
                "background-color",
                "#0466c8"
              );
              $(
                ".pm-dropdown-list li:nth-child(" + (j + 1) + ") iconify-icon"
              ).attr("style", "color: #e9ecef");
              $(".pm-dropdown-list li:nth-child(" + (j + 1) + ") p").css(
                "color",
                "#e9ecef"
              );
            } else {
              $(".pm-dropdown-list li:nth-child(" + (j + 1) + ")").css(
                "background-color",
                "#dee2e6"
              );
              $(
                ".pm-dropdown-list li:nth-child(" + (j + 1) + ") iconify-icon"
              ).attr("style", "color: #0353a4");
              $(".pm-dropdown-list li:nth-child(" + (j + 1) + ") p").css(
                "color",
                "#0353a4"
              );
            }
          });

          $(".dpm-container").css("display", "none");
          $(".spm-category").css("display", "none");
          $(".spm-name").css("display", "none");
          $(selectedMenuType.class).css("display", "block");

          // Close menu
          menuDropdownOpen = false;
          updatePMDropdownStyles();
        }
      );
    });

    $(selectedMenuType.class).css("display", "block");

    let pmOption =
      '<div class="pm-product-container"><img src="../assets/images/no-selection-picture.png" alt="default-product-image" width="84" height="84" class="pm-product-image"/><h3>default-name</h3></div>';

    // Setup Default PM - Pillar Candles
    let pillarCandles = fetchCategory("pillars");
    pillarCandles.then((fetchedData) => {
      $.each(fetchedData, function (i, data) {
        $(".pillar-candles").append(pmOption);

        let imageLink = fetchImage(data.Product_SKU);
        imageLink.then((link) => {
          $(".pillar-candles div:nth-child(" + (i + 1) + ") img").attr(
            "src",
            link
          );
        });
        $(".pillar-candles div:nth-child(" + (i + 1) + ") h3").html(data.Name);

        // Handle on click event - Setup PMPC
        $(".pillar-candles div:nth-child(" + (i + 1) + ")").on(
          "click",
          function () {
            heightIndex = 0;
            colourIndex = 0;

            pmpcProduct.productSKU = data.Product_SKU;
            console.log(
              "currently selected product: " + pmpcProduct.productSKU
            );
            pmpcProduct.imageLink = $(
              ".pillar-candles div:nth-child(" + (i + 1) + ") img"
            ).attr("src");
            pmpcProduct.name = data.Name;
            pmpcProduct.description = data.Description;
            pmpcProduct.prices = data.Price;
            pmpcProduct.selectedPrice = pmpcProduct.prices[heightIndex];
            pmpcProduct.storeLink = data["Product Page Link"];
            pmpcProduct.heights = data.Dimensions.Height;
            pmpcProduct.selectedHeight = pmpcProduct.heights[heightIndex];
            if ("Color Options" in data) {
              pmpcProduct.colours = data["Color Options"];
              pmpcProduct.selectedColour = pmpcProduct.colours[colourIndex];
            } else {
              pmpcProduct.colours = [];
              pmpcProduct.selectedColour = { name: "", hexcode: "" };
            }
            pmpcProduct.categories = data.Category;
            if ("Diameter" in data.Dimensions) {
              pmpcProduct.diameter = data.Dimensions.Diameter;
            } else {
              pmpcProduct.diameter = -1;
            }
            updatePMPC();
          }
        );
      });
    });
    $(".pm-vc-pillar").on("click", function () {
      goToCategorySearch(1);
    });

    // Setup Default PM - Taper Candles
    let taperCandles = fetchCategory("tapers");
    taperCandles.then((fetchedData) => {
      $.each(fetchedData, function (i, data) {
        $(".taper-candles").append(pmOption);

        let imageLink = fetchImage(data.Product_SKU);
        imageLink.then((link) => {
          $(".taper-candles div:nth-child(" + (i + 1) + ") img").attr(
            "src",
            link
          );
        });
        $(".taper-candles div:nth-child(" + (i + 1) + ") h3").html(data.Name);

        // Handle on click event - Setup PMPC
        $(".taper-candles div:nth-child(" + (i + 1) + ")").on(
          "click",
          function () {
            heightIndex = 0;
            colourIndex = 0;

            pmpcProduct.productSKU = data.Product_SKU;
            console.log(
              "currently selected product: " + pmpcProduct.productSKU
            );
            pmpcProduct.imageLink = $(
              ".taper-candles div:nth-child(" + (i + 1) + ") img"
            ).attr("src");
            pmpcProduct.name = data.Name;
            pmpcProduct.description = data.Description;
            pmpcProduct.prices = data.Price;
            pmpcProduct.selectedPrice = pmpcProduct.prices[heightIndex];
            pmpcProduct.storeLink = data["Product Page Link"];
            pmpcProduct.heights = data.Dimensions.Height;
            pmpcProduct.selectedHeight = pmpcProduct.heights[heightIndex];
            if ("Color Options" in data) {
              pmpcProduct.colours = data["Color Options"];
              pmpcProduct.selectedColour = pmpcProduct.colours[colourIndex];
            } else {
              pmpcProduct.colours = [];
              pmpcProduct.selectedColour = { name: "", hexcode: "" };
            }
            pmpcProduct.categories = data.Category;
            if ("Diameter" in data.Dimensions) {
              pmpcProduct.diameter = data.Dimensions.Diameter;
            } else {
              pmpcProduct.diameter = -1;
            }

            updatePMPC();
          }
        );
      });
    });
    $(".pm-vc-taper").on("click", function () {
      goToCategorySearch(4);
    });

    // Setup Default PM - Specialty Candles
    let specialtyCandles = fetchCategory("specialty");
    specialtyCandles.then((fetchedData) => {
      $.each(fetchedData, function (i, data) {
        $(".specialty-candles").append(pmOption);

        let imageLink = fetchImage(data.Product_SKU);
        imageLink.then((link) => {
          $(".specialty-candles div:nth-child(" + (i + 1) + ") img").attr(
            "src",
            link
          );
        });
        $(".specialty-candles div:nth-child(" + (i + 1) + ") h3").html(
          data.Name
        );

        // Handle on click event - Setup PMPC
        $(".specialty-candles div:nth-child(" + (i + 1) + ")").on(
          "click",
          function () {
            heightIndex = 0;
            colourIndex = 0;

            pmpcProduct.productSKU = data.Product_SKU;
            console.log(
              "currently selected product: " + pmpcProduct.productSKU
            );
            pmpcProduct.imageLink = $(
              ".specialty-candles div:nth-child(" + (i + 1) + ") img"
            ).attr("src");
            pmpcProduct.name = data.Name;
            pmpcProduct.description = data.Description;
            pmpcProduct.prices = data.Price;
            pmpcProduct.selectedPrice = pmpcProduct.prices[heightIndex];
            pmpcProduct.storeLink = data["Product Page Link"];
            pmpcProduct.heights = data.Dimensions.Height;
            pmpcProduct.selectedHeight = pmpcProduct.heights[heightIndex];
            if ("Color Options" in data) {
              pmpcProduct.colours = data["Color Options"];
              pmpcProduct.selectedColour = pmpcProduct.colours[colourIndex];
            } else {
              pmpcProduct.colours = [];
              pmpcProduct.selectedColour = { name: "", hexcode: "" };
            }
            pmpcProduct.categories = data.Category;
            if ("Diameter" in data.Dimensions) {
              pmpcProduct.diameter = data.Dimensions.Diameter;
            } else {
              pmpcProduct.diameter = -1;
            }

            updatePMPC();
          }
        );
      });
    });
    $(".pm-vc-specialty").on("click", function () {
      goToCategorySearch(2);
    });

    // Setup other menus in Product Menu
    setupCategorySearchPM();
    setupNameSearchPM();
  });
}

// Run function once to setup Help Menu
function setupHP() {
  $(document).ready(function () {
    $(".hm-wrapper").load(
      "help-menu.html",
      function (responseTxt, statusTxt, xhr) {
        if (statusTxt == "success") {
          console.log("SUCCESSFULLY LOADED HELP MENU");
        } else if (statusTxt == "error") {
          console.log("ERROR LOADING HELP MENU: " + xhr.statusText);
        }
      }
    );

    $(".open-hm-button").on("click", function () {
      $(".hm-container").animate({ left: 0 });
    });
  });

  // Setup temp screenshot feature
  $(".close-screenshot-button").hide();
  $(".open-screenshot-button").on("click", function () {
    $(".app-UI").hide();
    $(".close-screenshot-button").show();
  });
  $(".close-screenshot-button").on("click", function () {
    $(".app-UI").show();
    $(".close-screenshot-button").hide();
  });
}

setupPM();
setupHP();
