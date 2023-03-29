async function fetchCategory(productCategory) {
  let fetchedData;
  await fetch(`http://54.190.18.140:8080/api/categories/${productCategory}`, {
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

async function fetchImage(productSKU) {
  let imageLink;
  await fetch(`http://54.190.18.140:8080/api/product_images/${productSKU}`, {
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

// PM dropdown data
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

// PMPC data
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

// PMCS data
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
    buttonWidth: "2.25rem",
    selected: false,
  },
  {
    id: 1,
    name: "Pillars",
    buttonWidth: "4.5rem",
    selected: false,
  },
  {
    id: 2,
    name: "Specialty",
    buttonWidth: "4.5rem",
    selected: false,
  },
  {
    id: 3,
    name: "Tealights",
    buttonWidth: "4.5rem",
    selected: false,
  },
  {
    id: 4,
    name: "Tapers",
    buttonWidth: "4.5rem",
    selected: false,
  },
  {
    id: 5,
    name: "Votives",
    buttonWidth: "4.5rem",
    selected: false,
  },
];

// PM Name Search data

function updatePMDropdownStyles() {
  if (menuDropdownOpen) {
    $(".pm-dropdown-button-arrow").removeAttr("flip");
    $(".pm-dropdown-list").css("display", "block");
  } else {
    $(".pm-dropdown-button-arrow").attr("flip", "vertical");
    $(".pm-dropdown-list").css("display", "none");
  }
}

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

function updatePMPC() {
  $(".pmpc-product-image").attr("src", pmpcProduct.imageLink);
  $(".pmpc-header-text-container h1").html(pmpcProduct.name);
  $(".pmpc-header-text-container p").html(pmpcProduct.description);
  $(".pmpc-price").html("$" + pmpcProduct.selectedPrice + ".00");
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
          $(".pmpc-price").html("$" + pmpcProduct.selectedPrice + ".00");
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
  });

  // Make PMPC visible
  $(".pmpc-background-dim").css("display", "block");
  $(".pmpc-container").css("display", "block");
}

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
    $(".pm-cs-price").html("$" + pmcsProduct.selectedPrice + ".00");
    $(".pm-cs-height").html(pmcsProduct.selectedHeight + '"');
    if (pmcsProduct.colours.length > 0) {
      $(".pm-cs-colour").html(pmcsProduct.selectedColour.name);
    } else {
      $(".pm-cs-colour").html("N/A");
    }
    $(".pm-cs-description").html(pmcsProduct.description);
  }
}

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

function setupCategorySearchPM() {
  let pmCategorySearchOption =
    '<button class="spm-category-button">default-category</button>';

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
      }
    );
  });

  updateCategoryButtons();
}

function setupNameSearchPM() {}

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
          $(".spm-category").css("display", "none");
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
        console.log(data);
      });
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
        //console.log(data);
      });
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
        //console.log(data);
      });
    });

    setupCategorySearchPM();
    setupNameSearchPM();
  });
}

export { setupPM };

/*
$(document).ready(function () {
  setupPM();
});
*/
