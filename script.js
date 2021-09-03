for (let e of document.querySelectorAll(
  'input[type="range"].slider-progress'
)) {
  e.style.setProperty("--value", e.value);
  e.style.setProperty("--min", e.min == "" ? "0" : e.min);
  e.style.setProperty("--max", e.max == "" ? "100" : e.max);
  e.addEventListener("input", () => e.style.setProperty("--value", e.value));
}

function Calendar2(id, year, month) {
  var Dlast = new Date(year, month + 1, 0).getDate(),
    D = new Date(year, month, Dlast),
    DNlast = new Date(D.getFullYear(), D.getMonth(), Dlast).getDay(),
    DNfirst = new Date(D.getFullYear(), D.getMonth(), 1).getDay(),
    calendar = "<tr>",
    month = [
      "Январь",
      "Февраль",
      "Март",
      "Апрель",
      "Май",
      "Июнь",
      "Июль",
      "Август",
      "Сентябрь",
      "Октябрь",
      "Ноябрь",
      "Декабрь",
    ];
  if (DNfirst != 0) {
    for (var i = 1; i < DNfirst; i++) calendar += "<td>";
  } else {
    for (var i = 0; i < 6; i++) calendar += "<td>";
  }
  for (var i = 1; i <= Dlast; i++) {
    if (
      i == new Date().getDate() &&
      D.getFullYear() == new Date().getFullYear() &&
      D.getMonth() == new Date().getMonth()
    ) {
      calendar += '<td class="today">' + i;
    } else {
      calendar += "<td>" + i;
    }
    if (new Date(D.getFullYear(), D.getMonth(), i).getDay() == 0) {
      calendar += "<tr>";
    }
  }
  for (var i = DNlast; i < 7; i++) calendar += "<td>&nbsp;";
  document.querySelector("#" + id + " tbody").innerHTML = calendar;
  document.querySelector("#" + id + " thead td:nth-child(2)").innerHTML =
    month[D.getMonth()] + " " + D.getFullYear();
  document.querySelector("#" + id + " thead td:nth-child(2)").dataset.month =
    D.getMonth();
  document.querySelector("#" + id + " thead td:nth-child(2)").dataset.year =
    D.getFullYear();
  if (document.querySelectorAll("#" + id + " tbody tr").length < 6) {
    // чтобы при перелистывании месяцев не "подпрыгивала" вся страница, добавляется ряд пустых клеток. Итог: всегда 6 строк для цифр
    document.querySelector("#" + id + " tbody").innerHTML +=
      "<tr><td>&nbsp;<td>&nbsp;<td>&nbsp;<td>&nbsp;<td>&nbsp;<td>&nbsp;<td>&nbsp;";
  }
}
Calendar2("calendar2", new Date().getFullYear(), new Date().getMonth());
// переключатель минус месяц
document.querySelector(
  "#calendar2 thead tr:nth-child(1) td:nth-child(1)"
).onclick = function () {
  Calendar2(
    "calendar2",
    document.querySelector("#calendar2 thead td:nth-child(2)").dataset.year,
    parseFloat(
      document.querySelector("#calendar2 thead td:nth-child(2)").dataset.month
    ) - 1
  );
};
// переключатель плюс месяц
document.querySelector(
  "#calendar2 thead tr:nth-child(1) td:nth-child(3)"
).onclick = function () {
  Calendar2(
    "calendar2",
    document.querySelector("#calendar2 thead td:nth-child(2)").dataset.year,
    parseFloat(
      document.querySelector("#calendar2 thead td:nth-child(2)").dataset.month
    ) + 1
  );
};

function getCoords(elem) {
  /*Получаем координаты относительно окна браузера*/
  let coords = elem.getBoundingClientRect();
  /*Высчитываем значения координат относительно документа, вычисляя прокрутку документа*/
  return {
    top: coords.top + window.pageYOffset,
    left: coords.left + window.pageXOffset,
    leftX: coords.left,
    rigth: coords.left + window.pageXOffset + coords.width,
    bottom: coords.top + window.pageYOffset + coords.height,
    width: coords.width,
  };
}

function moveRange(elem) {
  /*Находим нужный элемент по классу или id*/
  var coords = getCoords(elem);

  /*Определяем зону окрашывания*/
  var colorRange = elem.parentElement.children[1];
  var f; //устанавливаем флаг для определения мин или макс элемента
  var value; //значение фильтра

  /*Определяем второй ползунок и родителя*/
  var parent = {};
  parent.element = elem.parentElement;
  parent.coords = getCoords(parent.element);

  var block2 = {};
  if (elem.classList.contains("block-min")) {
    block2.element = elem.parentElement.children[2];
    block2.coords = getCoords(block2.element);
    f = 0;
  } else {
    block2.element = elem.parentElement.children[0];
    block2.coords = getCoords(block2.element);
    f = 1;
  }

  /*Делаем индикатор над ползунком*/
  var indicator = document.createElement("div");
  if (elem.children.length) {
    elem.innerHTML = ""; //обнуляем предыдущее значение
  }
  elem.appendChild(indicator);

  document.addEventListener("mousemove", onMouseMove);
  document.addEventListener("mouseup", onMouseUp);
  document.addEventListener("touchmove", onMouseMove);
  document.addEventListener("touchend", onMouseUp);

  /*выключаем браузерное событие DaD*/
  elem.ondragstart = function () {
    return false;
  };

  function onMouseMove(e) {
    /*Определяем смещение влево*/
    e.preventDefault(); //предотвратить запуск выделения элементов

    /*Определяем положение мыши в зависимости от устройства*/
    /*На мобильных устройствах может фиксироваться несколько точек касания, поэтому используется массив targetTouches*/
    /*Мы будем брать только первое зафиксированое касание по экрану targetTouches[0]*/
    if (e.touches === undefined) {
      var pos = e.clientX;
    } else {
      var pos = e.targetTouches[0].clientX;
    }

    /*Устанавливаем границы движения ползунка*/
    let newLeft = pos - parent.coords.leftX;
    let rigthEdge = parent.coords.width - (coords.width + 1);

    if (newLeft < 0) {
      newLeft = 0;
    } else if (newLeft > rigthEdge) {
      newLeft = rigthEdge;
    }
    if (f == 0 && pos > block2.coords.left - block2.coords.width) {
      newLeft = block2.coords.left - block2.coords.width - parent.coords.leftX;
    } else if (f == 1 && pos < block2.coords.rigth + 5) {
      newLeft = block2.coords.rigth - block2.coords.left;
    }
    /*устанавливаем отступ нашему элементу*/
    elem.style.left = newLeft + "px";

    //     Определяем значение фильтра
    let rangeMin = +document.querySelector(".filter number:first-child")
      .innerHTML;
    let rangeMax = +document.querySelector(".filter number:last-child")
      .innerHTML;
    if (f == 0) {
      value = (
        newLeft / (parent.coords.width / (rangeMax - rangeMin)) +
        rangeMin
      ).toFixed(1);
    } else {
      value = (
        newLeft / (parent.coords.width / (rangeMax - rangeMin)) +
        0.3 +
        rangeMin
      ).toFixed(1);
    }

    /*Выводим значение над ползунком*/
    indicator.style.position = "absolute";
    indicator.style.fontSize = "14px";
    indicator.style.left = -coords.width / 2 + "px";
    indicator.style.top =
      parseFloat(window.getComputedStyle(elem).getPropertyValue("top")) -
      10 +
      "px";

    /*Для красоты слайдера уберем вывод значений в начальной и конечной точках*/
    if (value <= rangeMin) {
      indicator.innerHTML = "";
    } else if (value >= rangeMax) {
      indicator.innerHTML = "";
    } else {
      indicator.innerHTML = value;
    }

    /*Делаем цветную плашечку диапазона выбора*/
    if (f == 0) {
      colorRange.style.left = newLeft + coords.width + "px";
      colorRange.style.width =
        block2.coords.left - getCoords(elem).left - coords.width + "px";
    } else {
      colorRange.style.left = block2.coords.left - parent.coords.leftX + "px";
      colorRange.style.width = getCoords(elem).left - block2.coords.left + "px";
    }
  }

  function onMouseUp() {
    document.removeEventListener("mouseup", onMouseUp);
    document.removeEventListener("mousemove", onMouseMove);
    document.removeEventListener("touchend", onMouseUp);
    document.removeEventListener("touchmove", onMouseMove);
  }
}

let currentTab = document.querySelectorAll(".current-tab");
let currentTab2 = document.querySelectorAll(".current-tab2");
let currentTab3 = document.querySelectorAll(".current-tab3");
let currentTab4 = document.querySelectorAll(".current-tab4");
let currentTab5 = document.querySelectorAll(".current-tab5");
let currentTab6 = document.querySelectorAll(".current-tab6");


currentTab.forEach((item) => {
  item.addEventListener("click", () => {
    currentTab.forEach((item) => item.classList.remove("current-tab_active"));
    item.classList.add("current-tab_active");
  });
});

currentTab2.forEach((item) => {
  item.addEventListener("click", () => {
    currentTab2.forEach((item) => item.classList.remove("current-tab_active"));
    item.classList.add("current-tab_active");
  });
});
currentTab3.forEach((item) => {
  item.addEventListener("click", () => {
    currentTab3.forEach((item) => item.classList.remove("current-tab_active"));
    item.classList.add("current-tab_active");
  });
});
currentTab4.forEach((item) => {
  item.addEventListener("click", () => {
    currentTab4.forEach((item) => item.classList.remove("current-tab_active"));
    item.classList.add("current-tab_active");
  });
});
currentTab5.forEach((item) => {
  item.addEventListener("click", () => {
    currentTab5.forEach((item) => item.classList.remove("current-tab_active"));
    item.classList.add("current-tab_active");
  });
});
currentTab6.forEach((item) => {
  item.addEventListener("click", () => {
    currentTab6.forEach((item) => item.classList.remove("current-tab_active"));
    item.classList.add("current-tab_active");
  });
});


let paginationNumber = document.getElementById("paginationNumber");
let paginationPrev = document.getElementById("paginationPrev");
let paginationNext = document.getElementById("paginationNext");

let number = 0;
paginationNumber.textContent = number;

paginationPrev.addEventListener("click", ()=>{
  number--;
  paginationNumber.textContent = number;
})

paginationNext.addEventListener("click", ()=>{
  number++;
  paginationNumber.textContent = number;
})

const circle = document.querySelector('.progress-ring__circle');
const r = circle.r.baseVal.value;
const circumference = 2 * Math.PI * r;
const input = document.querySelector('.percente');

circle.style.strokeDasharray = `${circumference} ${circumference}`;
circle.style.strokeDashoffset = circumference;

function setProgress(percent) {
  const offset = circumference - percent / 100 * circumference;
  circle.style.strokeDashoffset = offset;
}

setProgress(69);