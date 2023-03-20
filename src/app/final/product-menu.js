async function fetchText() {
  console.log("HUH");
  let response = await fetch(
    `http://54.190.18.140:8080/api/categories/pillars`,
    {
      method: "GET",
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET",
        "Access-Control-Allow-Headers": "Content-Type",
        "Content-Type": "application/json",
      },
    }
  );
  let data = await response.text();
  console.log("BUH");
  console.log(data);
}

$(document).ready(function () {
  fetchText();
  $(".open-pm-button").on("click", function () {
    $(".pm-container").animate({ top: 192 });
    $(".background-blur").animate({ opacity: 0.5 });
    $(".background-blur").css("display", "block");
  });

  $(".close-pm-button-container").on("click", function () {
    $(".pm-container").animate({ top: "100vh" });
    $(".background-blur").animate({ opacity: 0 });
    $(".background-blur").css("display", "none");
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
    '<div class="pm-product-container"><img src="../assets/images/no-selection-picture.png" alt="default-product-image" width="84" height="84" class="pm-product-image"/><h3>{{ s.name }}</h3></div>';
  let testData;
  console.log("ASDF");
  // Default product menu
  /*
  $.ajax({
    url: `http://54.190.18.140:8080/api/categories/pillars`,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Content-Type": "application/json",
    },
    method: "GET",
    dataType: "jsonp",
  }).done(function (data, textStatus, jqXHR) {
    console.log("TYUI");
    testData = data;
  });
  console.log("JKL:");
  console.log(testData);

  $.getJSON(
    "http://54.190.18.140:8080/api/categories/pillars?callback=?",
    function (result) {
      $.parseJSON(result);
      console.log(JSON.parse(result));
    }
  );
    */
  /*
  fetch(`http://54.190.18.140:8080/api/categories/pillars`, {
    method: "GET",
    mode: "no-cors",
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Content-Type": "application/json",
    },
  })
    .then((response) => console.log(response))
    .then((data) => console.log(data))
    .catch((error) => console.log(error));
    */
});
