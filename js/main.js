console.clear();

let index = 0;
let personTable = document.querySelector('.table-person');
let groupTable = document.querySelector('.table-group');
let select = document.querySelector('.custom-select');
let personTableTbody = document.querySelector('.table-person-tbody');
let groupTableTbody = document.querySelector('.table-group-tbody');
let url = `https://raw.githubusercontent.com/hexschool/js-traninging-week6API/main/data.json`;
let data = [];

initData('個人時間排名');
function initData(select){
  axios.get(url).then((res)=>{
    data = res.data;
    optionData(select);
  }).catch((e)=>{
    console.log(e);
  })
}

function optionData(select){
  personTableTbody.innerHTML = '';
  groupTableTbody.innerHTML = '';
  switch(select){
    case '個人時間排名':
      personSort(data, '個人時間排名');
      personTable.classList.add('d-block');
      groupTable.classList.add('d-none');
      personTable.classList.remove('d-none');
      groupTable.classList.remove('d-block');
      break;
    case '組別投稿數排名':
    case '組別投稿平均時間排名':
      initGroupData(data, select)
      personTable.classList.remove('d-block');
      personTable.classList.add('d-none');
      groupTable.classList.remove('d-none');
      groupTable.classList.add('d-block');
      break;
    default:
      data.forEach(item=>{
        templateRender(item);
      })
      break;
  }
}

// 個人時間排名
function personSort(data, template){
  index = 0;
  data = data.sort(function (a, b) {
    let itemA = (a.practiceMinute*60) + Number(a.practiceSecond);
    let itemB = (b.practiceMinute*60) + Number(b.practiceSecond);
    return itemA - itemB ;
  });
  pagination(data, template);
}

// 組別投稿數排名/組別投稿平均時間排名 -群組分類骰選
function initGroupData(data, template){
  index = 0;
  let newData = [];
  let set = new Set();
  let uniKeyGroup = data.filter( item => !set.has(item.jsGroup) ? set.add(item.jsGroup) : false );
  uniKeyGroup.forEach(unikey => {
    let groupObj = {};
    let tempTeamTime = [];
    let submit = 0;
    data.forEach(item => {
      if(item.jsGroup == unikey.jsGroup){
        groupObj.jsGroup = item.jsGroup;
        submit += 1;
        groupObj.submit = submit;
        tempTeamTime.push((item.practiceMinute*60) + Number(item.practiceSecond));
        groupObj.timer = tempTeamTime;
      }
    })
    newData.push(groupObj);
  })
  newData.forEach(item => {
    item.timer = Math.round(([...item.timer].reduce((a,b)=> a+b))/item.submit);
  })
  groupClassis(newData, template);
}

// 組別投稿數排名/組別投稿平均時間排名
function groupClassis(newData, template){
  newData.sort((a, b) => template == '組別投稿數排名' ? b.submit - a.submit : a.timer - b.timer)
  newData.forEach(item => templateRender(item, template));
}

// 字串模板選染
function templateRender(item, template){
  let str = null;
  switch(template){
    case '個人時間排名':
      str = `
      <tr>
        <th class="text-center align-middle" scope="row">${item.index + 1}</th>
        <td class="align-middle">${item.slackName}</td>
        <td class="text-center align-middle">${item.jsGroup}</td>
        <td class="text-center align-middle"><a href="${item.youtubeUrl}">連結</a></td>
        <td class="text-center align-middle"><a href="${item.codepenUrl}">連結</a></td>
        <td class="align-middle">${item.message}</td>
        <td class="text-center align-middle">${item.practiceMinute}分 : ${item.practiceSecond}秒</td>
      </tr>
      `
      personTableTbody.innerHTML += str;
      break;
    case '組別投稿數排名':
    case '組別投稿平均時間排名':
      str = `
      <tr>
        <th class="text-center">${index += 1}</th>
        <td class="text-center">${item.jsGroup}</td>
        <td class="text-center">${item.submit}</td>
        <td class="text-center">${item.timer}</td>
      </tr>
      `
      groupTableTbody.innerHTML += str;
      break;
  }
}

// 頁碼功能
function pagination(data, template){
  let pagination = document.querySelector('.pagination');
  let firstLoad = true;
  let currentPage = 1;
  let pageTempalte = '';
  let pageItemDefaultNum = 10;
  let pageList = Math.ceil( data.length / pageItemDefaultNum );

  for(let x = 1 ; x <= pageList ; x++){
    pageTempalte += `<li class="page-item"><a class="page-link" href="#">${x}</a></li>`
  }
  pagination.innerHTML = pageTempalte;
  let pageItem = document.querySelectorAll('.page-item');
  
  pageItem.forEach(item => {
    if(currentPage == 1 && firstLoad == true){
      item.classList.add('active');
      personDataSlice(currentPage, pageItemDefaultNum, template);
      firstLoad = false;
    }
    item.addEventListener('click', (e)=>{
      pageItem.forEach(page=>page.classList.remove('active'));
      personTableTbody.innerHTML = '';
      currentPage = e.toElement.innerText;
      e.target.parentNode.classList.add('active')
      personDataSlice(currentPage, pageItemDefaultNum, template);
      })
  })
}

// 個人排名一頁筆數顯示篩選
function personDataSlice(currentPage, pageItemDefaultNum, template){
  let limitItem = null;
  limitItem = data.slice((currentPage-1)* pageItemDefaultNum, currentPage * pageItemDefaultNum);
  limitItem.forEach((item, index)=>{
    item.index = index;
    if(item.message == undefined){
      item.message = ''
    }
    templateRender(item, template);
  })
}