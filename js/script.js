// 拉伸左側的sidenav
  function openNav() {
    document.getElementById("mySidenav").style.left = "0";
    document.body.style.backgroundColor = "rgba(0,0,0,0.7)";
    document.getElementById("mySidenav").style.border = "#A5BDC6";

    // 淡化下方物件顏色並禁用操作
    var elements = document.getElementsByClassName("container-fluid");
    for (var i = 0; i < elements.length; i++) {
      elements[i].style.opacity = "0.5";
      elements[i].style.filter = "brightness(50%)";
      elements[i].style.pointerEvents = "none";
    }
  }
  
  /* Set the left position of the side navigation to -100% */
  function closeNav() {
    document.getElementById("mySidenav").style.left = "-100%";
    document.body.style.backgroundColor = "white";
    document.getElementById("mySidenav").style.border = "white";

    // 恢復下方物件的顏色和操作
    var elements = document.getElementsByClassName("container-fluid");
    for (var i = 0; i < elements.length; i++) {
      elements[i].style.opacity = "1";
      elements[i].style.filter = "none";
      elements[i].style.pointerEvents = "auto";
    }
  }
