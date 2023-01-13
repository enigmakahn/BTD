//Settings - Enter your ticket status and API key

let RDapi = "ENTER YOUR API";
let priorityQue = ["Same Day Repair", "RUSH - Priority Service"];
let regularQue = ["Pending", "In Progress"];
let waitingQue = ["Waiting on Customer", "Waiting for Parts"];
let schedQue = ["Scheduled"];


//Options

//Add the waiting tickets at the top of the page
let waitingBool = false;
//Add scheduled tickets to the top of the page
let schedBool = false;
//  Portrait = true ---- Widescreen = false
let portVar = true;


// Do not edit beyond this line
let now = new Date();

fetch('https://api.repairdesk.co/api/web/v1/tickets?api_key=' + RDapi)
  .then((response) => response.json())
  .then((data) => {
    pagebuilder(data['data']);
    if (!portVar) {
      setTimeout(function () {
        resizeAllGridItems();
      }, 1500);
    }
  });

function pagebuilder(Tdata) {
  queBuilder(Tdata, priorityQue);
  queBuilder(Tdata, regularQue);
  if (schedBool) {
    queBuilder(Tdata, schedQue);
  }
  if (waitingBool) {
    queBuilder(Tdata, waitingQue);
  }
}

function queBuilder(Tdata, que) {
  if (!portVar) {
    document.getElementById("bodyCont").classList.add('land');
  }
  let cellOutput = '';
  if (que.includes(regularQue[0])) {
    cellOutput = '<h3>Regular Que</h3>';
  }
  if (que.includes(priorityQue[0])) {
    cellOutput = '<h3>Priority Que</h3>';
  }
  Tdata['ticketData'].slice().reverse().forEach(element => {
    if (que.includes(element["devices"]["0"]["status"]["name"])) {
      if (que.includes(regularQue[0])) {
        document.getElementById("bodyCont").insertAdjacentHTML("beforeend", cellbuilder(element, cellOutput));
        cellOutput = '';
      }
      if (que.includes(priorityQue[0])) {
        document.getElementById("bodyCont").insertAdjacentHTML("afterbegin", cellbuilder(element, cellOutput));
        cellOutput = '';
      }
      if (que.includes(waitingQue[0])) {
        document.getElementById("bodyCont").insertAdjacentHTML("afterbegin", waitingbuilder(element, cellOutput));
        cellOutput = '';
      }
      if (que.includes(schedQue[0])) {
        document.getElementById("bodyCont").insertAdjacentHTML("afterbegin", schedbuilder(element, cellOutput));
        cellOutput = '';
      }
    }
  });
  if (que.includes(waitingQue[0])) {
    document.getElementById("bodyCont").insertAdjacentHTML("afterbegin", '<h3>Waiting Que</h3>');
  }
  if (que.includes(schedQue[0])) {
    document.getElementById("bodyCont").insertAdjacentHTML("afterbegin", '<h3>Scheduled Que</h3>');
  }
}

function cellbuilder(element, cellOutput) {
  cellOutput = cellOutput.concat('<div class="jobCont');
  if (portVar) {
    cellOutput = cellOutput.concat(' port');
  }
  cellOutput = cellOutput.concat('"><div class="tickDet ');
  let due = new Date(element["devices"]["0"]["due_on"] * 1000);
  let overdue = new Date(element["summary"]["created_date"] * 1000 + 1209600000);
  if (overdue.valueOf() < now.valueOf()) {
    cellOutput = cellOutput.concat('overdue ');
  }
  cellOutput = cellOutput.concat(element["devices"]["0"]["status"]["name"].replace(/\s/g, ''), '"><div class="ticketNo ');
  if (due.valueOf() < now.valueOf()) {
    cellOutput = cellOutput.concat(' late ');
  }
  cellOutput = cellOutput.concat('">', element["summary"]["order_id"], '</div><div class="name">', element["summary"]["customer"]["fullName"], ' </div><div class="jobdetails">', element["devices"]["0"]["device"]["name"], "<br>");
  if (element["devices"]["0"]["imei"] == '') {
    cellOutput = cellOutput.concat(element["devices"]["0"]["serial"]);
  } else {
    cellOutput = cellOutput.concat(element["devices"]["0"]["imei"]);
  }
  cellOutput = cellOutput.concat('</div><div class="job"><p>', element["devices"]["0"]["repairProdItems"]["0"]["name"], '</p></div></div><div class="jobDet" id="tick', element["summary"]["id"], '"><ul>');
  let URL = "https://api.repairdesk.co/api/web/v1/tickets/" + element["summary"]["id"] + "?api_key=" + RDapi;
  notes = fetch(URL)
    .then((response) => response.json())
    .then((data) => {
      let notes = '';
      data['data']['notes'].forEach(noteitem => {
        notes = notes.concat('<li>', noteitem['msg_text'], '</li>');
      });
      document.getElementById("tick" + element["summary"]["id"]).innerHTML = notes;
    })
  cellOutput = cellOutput.concat('</ul></div></div>');
  return cellOutput;
}

function schedbuilder(element, cellOutput) {
  cellOutput = cellOutput.concat('<div class="tickerNo ');
  if (portVar) {
    cellOutput = cellOutput.concat(' port2 ');
  }
  let due = new Date(element["devices"]["0"]["due_on"] * 1000);
  cellOutput = cellOutput.concat(element["devices"]["0"]["status"]["name"].replace(/\s/g, ''), '"><div class="waitNo ');
  if (due.valueOf() < now.valueOf()) {
    cellOutput = cellOutput.concat(' late ');
  }
  cellOutput = cellOutput.concat('">', element["summary"]["order_id"], '</div><div class="date">', due.toDateString().substring(0, due.toDateString().length - 4), due.toLocaleTimeString(), '</div><div class="waitName">', element["summary"]["customer"]["fullName"], '</div></div>');
  return cellOutput;

}

function waitingbuilder(element, cellOutput) {
  cellOutput = cellOutput.concat('<div class="tickerNo ');
  if (portVar) {
    cellOutput = cellOutput.concat(' port2 ');
  }
  let due = new Date(element["devices"]["0"]["due_on"] * 1000);
  if (due.valueOf() > now.valueOf()) {
    cellOutput = cellOutput.concat(' late ');
  }
  cellOutput = cellOutput.concat(element["devices"]["0"]["status"]["name"].replace(/\s/g, ''), '"><div class="waitNo">', element["summary"]["order_id"], '</div><div class="waitName">', element["summary"]["customer"]["fullName"].replace(/,\s([^,]+)$/, '<br>'), '</div></div>');
  return cellOutput;
}

//Resize function for after note load in multi Column
function resizeGridItem(item) {
  grid = document.getElementsByClassName("land")[0];
  rowHeight = parseInt(window.getComputedStyle(grid).getPropertyValue('grid-auto-rows'));
  rowGap = parseInt(window.getComputedStyle(grid).getPropertyValue('gap'));
  rowSpan = Math.ceil(((item.querySelector('.jobDet').getBoundingClientRect().height + rowGap) + 43) / (rowHeight + rowGap));
  item.style.gridRowEnd = "span " + rowSpan;
}

function resizeAllGridItems() {
  allItems = document.getElementsByClassName("jobCont");
  for (x = 0; x < allItems.length; x++) {
    resizeGridItem(allItems[x]);
  }
}


