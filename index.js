const BASE_URL = 'https://movie-list.alphacamp.io'
const INDEX_URL = BASE_URL + '/api/v1/movies/'
const POSTER_URL = BASE_URL + '/posters/'
const MOVIES_PER_PAGE = 12  // 每頁只顯示 12筆

const movies = []
let filteredMovies = [] //搜尋清單，變成全域變數
let ViewMode = true

const dataPanel = document.querySelector('#data-panel')
const searchForm = document.querySelector('#search-form')
const searchInput = document.querySelector('#search-input') //搜尋框
// const switchView = document.querySelector('#switch-view')

// page 
function getMoviesByPage(page) {
  const data = filteredMovies.length ? filteredMovies : movies // 如果搜尋清單有東西，就取搜尋清單 filteredMovies，否則就還是取總清單 movies
  // 計算起始 index
  const startIndex = (page - 1) * MOVIES_PER_PAGE
  // 回傳切割後的陣列
  return data.slice(startIndex, startIndex + MOVIES_PER_PAGE)
}

function renderPaginator(amount) {
  // 計算總頁數
  const numberOfPages = Math.ceil(amount / MOVIES_PER_PAGE)
  // 製作 HTML
  let rawHTML = ''
  for (let page = 1; page <= numberOfPages; page++) {
    rawHTML += `
    <li class="page-item"><a class="page-link" href="#"  data-page="${page}">${page}</a></li>
    `
    //放回 HTML
    paginator.innerHTML = rawHTML
  }
}

function renderMovieList(data) {
  let rawHTML = ''
  data.forEach((item) => {
    // title, image, id
    rawHTML += `<div class="col-sm-3">
    <div class="mb-2">
      <div class="card">
        <img src="${POSTER_URL + item.image}" class="card-img-top" alt="Movie Poster">
        <div class="card-body">
          <h5 class="card-title">${item.title}</h5>
        </div>
        <div class="card-footer">
          <button class="btn btn-primary btn-show-movie" data-toggle="modal" data-target="#movie-modal" data-id="${item.id}">More</button>
          <button class="btn btn-info btn-add-favorite" data-id="${item.id}">+</button>
        </div>
      </div>
    </div>
  </div>`
  })
  dataPanel.innerHTML = rawHTML
}



// function renderMovieList(data) {
//   let rawHTML = ''
//   if (ViewMode) {
//     data.forEach((item) => {
//       // title, image, id
//       rawHTML += `<div class="col-sm-3">
//     <div class="mb-2">
//       <div class="card">
//         <img src="${POSTER_URL + item.image}" class="card-img-top" alt="Movie Poster">
//         <div class="card-body">
//           <h5 class="card-title">${item.title}</h5>
//         </div>
//         <div class="card-footer">
//           <button class="btn btn-primary btn-show-movie" data-toggle="modal" data-target="#movie-modal" data-id="${item.id}">More</button>
//           <button class="btn btn-info btn-add-favorite" data-id="${item.id}">+</button>
//         </div>
//       </div>
//     </div>
//   </div>`
//     })
//   } else {
//     rawHTML = `<ul class="render-movie-list container-fluid list-group-flush">`
//     data.forEach((item) => {
//       rawHTML += ` 
//       <li class="list-group-item d-flex justify-content-between align-items-center">${item.title}
//         <div class="list-footer">
//           <button class="btn btn-primary btn-show-movie" data-toggle="modal" data-target="#movie-modal" data-id="${item.id}">More</button>
//           <button class="btn btn-info btn-add-favorite" data-id="${item.id}">+</button>
//         </div>
//       </li>
//       `
//     })
//     rawHTML += `</ul>`
//   }
//   dataPanel.innerHTML = rawHTML
// }


function showMovieModal(id) {
  const modalTitle = document.querySelector('#movie-modal-title')
  const modalImage = document.querySelector('#movie-modal-image')
  const modalDate = document.querySelector('#movie-modal-date')
  const modalDescription = document.querySelector('#movie-modal-description')
  axios.get(INDEX_URL + id).then((response) => {
    const data = response.data.results
    modalTitle.innerText = data.title
    modalDate.innerText = 'Release date: ' + data.release_date
    modalDescription.innerText = data.description
    modalImage.innerHTML = `<img src="${POSTER_URL + data.image}" alt="movie-poster" class="img-fluid">`
  })
}

// Favorite
function addToFavorite(id) {
  const list = JSON.parse(localStorage.getItem('favoriteMovies')) || []
  const movie = movies.find((movie) => movie.id === id)
  if (list.some((movie) => movie.id === id)) {
    return alert('此電影已經在收藏清單中！')
  }
  list.push(movie)
  localStorage.setItem('favoriteMovies', JSON.stringify(list))
}

// 監聽 data panel
dataPanel.addEventListener('click', function onPanelClicked(event) {
  if (event.target.matches('.btn-show-movie')) {
    showMovieModal(event.target.dataset.id)
  } else if (event.target.matches('.btn-add-favorite')) {
    addToFavorite(Number(event.target.dataset.id))
  }
})

// 轉換顯示方式
// switchView.addEventListener('click', function switchPage(event) {
//   // console.log(event.target)
//   if (event.target.matches('.list')) {
//     ViewMode = false
//     renderMovieList(getMoviesByPage(1))
//   } else if (event.target.matches('.grid')) {
//     ViewMode = true
//     renderMovieList(getMoviesByPage(1))
//   }
// })

// 監聽表單提交事件
// 送出關鍵字
searchForm.addEventListener('submit', function onSearchFormSubmitted(event) {
  event.preventDefault() //會請瀏覽器終止元件的預設行為，把控制權交給 JavaScript
  const keyword = searchInput.value.trim().toLowerCase()

  // if (!keyword.length) {
  //   return alert('請輸入有效字串！')
  // }

  filteredMovies = movies.filter((movie) =>
    movie.title.toLowerCase().includes(keyword)
  )

  if (filteredMovies.length === 0) {
    return alert(`您輸入的關鍵字：${keyword} 沒有符合條件的電影`)
  }
  // 重製分頁
  renderPaginator(filteredMovies.length)
  //預設顯示第 1 頁的搜尋結果
  renderMovieList(getMoviesByPage(1))
})

// 點擊 page 會到對應的page
paginator.addEventListener('click', function onPaginatorClicked(event) {
  //如果被點擊的不是 a 標籤，結束
  if (event.target.tagName !== 'A') return

  //透過 dataset 取得被點擊的頁數
  const page = Number(event.target.dataset.page)
  //更新畫面
  renderMovieList(getMoviesByPage(page))
})

axios
  .get(INDEX_URL)
  .then((response) => {
    movies.push(...response.data.results)
    // console.log(movies)
    renderPaginator(movies.length) // 並傳入資料的總筆數
    renderMovieList(getMoviesByPage(1)) // 呼叫函式
  })
  .catch((err) => console.log(err))