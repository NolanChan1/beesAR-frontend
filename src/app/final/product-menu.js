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

function updatePMPCDDStyles(ddOpen) {
  if (ddOpen) {
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

$(document).ready(function () {
  $(".open-pm-button").on("click", function () {
    $(".pm-container").animate({ top: 192 });
    $(".pm-background-dim").animate({ opacity: 0.5 });
    $(".pm-background-dim").css("display", "block");
  });

  $(".close-pm-button-container").on("click", function () {
    $(".pm-container").animate({ top: "100vh" });
    $(".pm-background-dim").animate({ opacity: 0 });
    $(".pm-background-dim").css("display", "none");
  });

  // Product menu dropdown
  let menuTypes = [
    { id: 1, name: "Default product menu", icon: "mdi:book-open" },
    {
      id: 2,
      name: "Search for products by category",
      icon: "material-symbols:category-outline-rounded",
    },
    {
      id: 3,
      name: "Search for products by name",
      icon: "material-symbols:search-rounded",
    },
  ];

  let selectedMenuType = menuTypes[0];
  let menuDropdownOpen = false;

  $(".pm-dropdown-button-icon").attr("icon", selectedMenuType.icon);
  $(".pm-dropdown-button-text").html(selectedMenuType.name);
  if (menuDropdownOpen) {
    $(".pm-dropdown-button-arrow").removeAttr("flip");
    $(".pm-dropdown-list").css("display", "block");
  } else {
    $(".pm-dropdown-button-arrow").attr("flip", "vertical");
    $(".pm-dropdown-list").css("display", "none");
  }

  let dropdownOption =
    '<li class="pm-dropdown-option-container"><iconify-icon icon="mdi:book-open" width="16" inline="true" style="color: #0353a4"></iconify-icon><p>menu-selection</p></li>';

  $.each(menuTypes, function (i, type) {
    $(".pm-dropdown-list").append(dropdownOption);
  });

  $.each(menuTypes, function (i, type) {
    $(".pm-dropdown-list li:nth-child(" + (i + 1) + ") iconify-icon").attr(
      "icon",
      type.icon
    );
    $(".pm-dropdown-list li:nth-child(" + (i + 1) + ") p").html(type.name);
    $(".pm-dropdown-list li:nth-child(" + (i + 1) + ") p").on(
      "click",
      function () {
        selectedMenuType = menuTypes[i];

        // Close menu
        menuDropdownOpen = false;
        $(".pm-dropdown-button-arrow").attr("flip", "vertical");
        $(".pm-dropdown-list").css("display", "none");

        // Update button
        $(".pm-dropdown-button-icon").attr("icon", selectedMenuType.icon);
        $(".pm-dropdown-button-text").html(selectedMenuType.name);

        // Update dropdown styles
        $.each(menuTypes, function (i, type) {
          if (selectedMenuType.id === type.id) {
            $(".pm-dropdown-list li:nth-child(" + (i + 1) + ")").css(
              "background-color",
              "#0466c8"
            );
            $(
              ".pm-dropdown-list li:nth-child(" + (i + 1) + ") iconify-icon"
            ).attr("style", "color: #e9ecef");
            $(".pm-dropdown-list li:nth-child(" + (i + 1) + ") p").css(
              "color",
              "#e9ecef"
            );
          } else {
            $(".pm-dropdown-list li:nth-child(" + (i + 1) + ")").css(
              "background-color",
              "#dee2e6"
            );
            $(
              ".pm-dropdown-list li:nth-child(" + (i + 1) + ") iconify-icon"
            ).attr("style", "color: #0353a4");
            $(".pm-dropdown-list li:nth-child(" + (i + 1) + ") p").css(
              "color",
              "#0353a4"
            );
          }
        });
      }
    );
  });

  // Update dropdown styles
  $.each(menuTypes, function (i, type) {
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
  });

  $(".pm-dropdown-button").on("click", function () {
    menuDropdownOpen = !menuDropdownOpen;
    if (menuDropdownOpen) {
      $(".pm-dropdown-button-arrow").removeAttr("flip");
      $(".pm-dropdown-list").css("display", "block");
    } else {
      $(".pm-dropdown-button-arrow").attr("flip", "vertical");
      $(".pm-dropdown-list").css("display", "none");
    }
  });

  let pmOption =
    '<div class="pm-product-container"><img src="../assets/images/no-selection-picture.png" alt="default-product-image" width="84" height="84" class="pm-product-image"/><h3>default-name</h3></div>';

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

          $(".pmpc-background-dim").css("display", "block");
          $(".pmpc-container").css("display", "block");

          $(".pmpc-product-image").attr("src", pmpcProduct.imageLink);
          $(".pmpc-header-text-container h1").html(pmpcProduct.name);
          $(".pmpc-header-text-container p").html(pmpcProduct.description);
          $(".pmpc-price").html("$" + pmpcProduct.selectedPrice + ".00");
          $(".pmpc-store-redirect-button").attr("href", pmpcProduct.storeLink);

          $(".pmpc-dropdown-list").empty();
          $(".pmpc-height").html(pmpcProduct.selectedHeight + '"');
          if (pmpcProduct.heights.length > 1) {
            $(".pmpc-height").css("display", "none");
            $(".pmpc-dropdown-container").css("display", "block");
            updatePMPCDDStyles(pmpcDropdownOpen);

            $(".pmpc-dropdown-button p").html(pmpcProduct.selectedHeight + '"');
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
                  $(".pmpc-price").html(
                    "$" + pmpcProduct.selectedPrice + ".00"
                  );
                  $(".pmpc-dropdown-button p").html(
                    pmpcProduct.selectedHeight + '"'
                  );
                  $(".pmpc-height").html(pmpcProduct.selectedHeight + '"');

                  $(".pmpc-selected-option").removeClass(
                    "pmpc-selected-option"
                  );
                  $(
                    ".pmpc-dropdown-list li:nth-child(" + (j + 1) + ")"
                  ).addClass("pmpc-selected-option");

                  pmpcDropdownOpen = false;
                  updatePMPCDDStyles(pmpcDropdownOpen);
                }
              );
            });

            $(
              ".pmpc-dropdown-list li:nth-child(" + (heightIndex + 1) + ")"
            ).addClass("pmpc-selected-option");
          } else {
            $(".pmpc-height").css("display", "block");
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
              $(
                ".pmpc-colour-row-container div:nth-child(" + (j + 1) + ") h1"
              ).html(pmpcOption.name);

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
            $(".pmpc-categories").append(
              pmpcCategoryOption + pmpcOption + "</p>"
            );
          });

          if (pmpcProduct.diameter === -1) {
            $(".pmpc-diameter").css("display", "none");
          } else {
            $(".pmpc-diameter").css("display", "block");
            $(".pmpc-diameter p").html(pmpcProduct.diameter + '"');
          }

          $(".pmpc-go-back-button").on("click", function () {
            $(".pmpc-background-dim").css("display", "none");
            $(".pmpc-container").css("display", "none");
          });
          $(".pmpc-swap-button").on("click", function () {
            $(".pmpc-background-dim").css("display", "none");
            $(".pmpc-container").css("display", "none");
          });
        }
      );
      console.log(data);
    });
  });
});
