(function ($, window) {
  let difficulties = [{
      mineNum: 10, //初级难度 雷数目 10
      wNum: 9, //网格宽 9 个格子
      hNum: 9 //网格高 9 个格子
    },
    {
      mineNum: 40, //中级难度
      wNum: 16,
      hNum: 16
    },
    {
      mineNum: 99, //高级难度
      wNum: 30,
      hNum: 16
    }
  ]

  //雷数字的颜色  1 蓝色	2 绿色 3 橙红色	4 深蓝色  5 深红色  6 青色 7 紫色	8 金色
  let fontColor = [
    "",
    "#4876FF",
    "#458B00",
    "#CD6600",
    "#27408B",
    "#B22222",
    "#48D1CC",
    "#CD00CD",
    "#EEC900",
    "#000000"
  ]
  const squareSize = 25
  let squareArr = [], //存放所有的方块
    minesPosSet = {}, //存放雷的位置信息的集合
    openedSet = {}, //存放已经打开的格子的集合
    surplusSquareNum = 0, //当前剩余未翻开的方块的数目
    currentMineNum = 0, //当前剩余的雷的数目
    nowLevel = 0, //当前的等级难度
    timer = null, //游戏时间计时器
    spaceSet = {},
    gameStyle = "greyStyle", //保存当前游戏界面
    timeStr = "00:00:00"

  function layoutBoard(attr) {
    let container = $(".container"), //整个游戏界面的容器
      gameArea = container.children(".gameArea"), //游戏操作区域
      width = attr.wNum,
      height = attr.hNum,
      mines = attr.mineNum,
      gameAreaWidth = width * squareSize,
      gameAreaHeight = height * squareSize,
      elementStr = ""

    // 初始化
    // 游戏等级
    // 现在所剩雷数
    currentMineNum = mines
    // 剩余的方块数
    surplusSquareNum = width * height

    // 时间和剩余雷数赋值

    $(".time-num").text("00:00:00")
    $(".mine-num").text(currentMineNum)

    // 将 container 移到屏幕中心
    container.css({
      left: ($(window).width() - gameAreaWidth - 40) / 2 + "px",
      top: ($(window).height() - gameAreaHeight - 120) / 2 + "px",
      width: gameAreaWidth + 40 + "px",
      height: gameAreaHeight + 120 + "px"
    })
    // 游戏区域大小
    gameArea.css({
      width: gameAreaWidth + "px",
      height: gameAreaHeight + "px"
    })
    //添加方块
    for (let i = 0; i < width * height; i++) {
      elementStr +=
        '<div class="square"><span></span><span class=' +
        gameStyle +
        "></span></div>"
    }
    //添加到游戏区域
    gameArea.append(elementStr)

    //给每个方块添加属性,将全部方块放进二维数组
    for (
      let i = 0, n = 0, tempArr = gameArea.find(".square"); i < height; i++
    ) {
      squareArr[i] = []
      for (let j = 0; j < width; j++) {
        tempArr.eq(n).prop({
          row: i, //方块所在行
          col: j, //方块所在列
          state: 0, //方块的状态位
          // -1:已翻开,不可点击, 0:未翻开 可点击, 1:已标记红旗 2:已标记问号
          aroundMines: 0, //方块周围的雷的数目
          isMine: false, //方块是否是地雷
          isMarked: false //方块是否被标记
        })
        squareArr[i][j] = tempArr.eq(n++) //存放方块
      }
    }
    randomMinePosition(attr)
  }

  // 随机安放雷的位置函数
  function randomMinePosition(attr) {
    let cols = attr.wNum,
      rows = attr.hNum,
      mines = attr.mineNum;
    for (let i = 0; i < mines;) {
      // 随机放雷
      // 为了避免重复 利用键值对保存
      let r = Math.floor(rows * Math.random()),
        c = Math.floor(cols * Math.random()),
        mineKey = r + "*" + c
      if (minesPosSet[mineKey] === undefined) {
        minesPosSet[mineKey] = {
          row: r,
          col: c
        }
        // i++放这里来判断雷数
        i++
      }
    }
    //调用计算每个方块周围的雷的数目函数
    getAroundMines(minesPosSet)
  }

  function getAroundMines(minesPosSet) {
    let curDifficult = difficulties[nowLevel]
    for (let key in minesPosSet) {
      let mineObj = minesPosSet[key]
      let [r, c] = [mineObj.row, mineObj.col]
      // 为雷区添加背景图 并改变属性isMine为true
      squareArr[r][c].addClass("bg-mine").prop("isMine", true)
      for (let i = r - 1; i <= r + 1; i++) {
        for (let j = c - 1; j <= c + 1; j++) {
          // 超过了边界 则继续
          if (
            i < 0 ||
            j < 0 ||
            i >= curDifficult.hNum ||
            j >= curDifficult.wNum
          ) {
            continue
          }
          // 遍历到当前位置或者雷区 则继续
          if ((i == r && j == c) || minesPosSet[i + "*" + j] !== undefined) {
            continue
          }
          // 遍历到非雷区
          // 则将雷数加一
          squareArr[i][j].prop("aroundMines", (index, pro) => {
            return pro + 1
          })
        }
      }
    }
    //将上面标记好的周围雷的数目写到html中
    for (let i = 0, h = curDifficult.hNum; i < h; i++) {
      for (let j = 0, w = curDifficult.wNum; j < w; j++) {
        let square = squareArr[i][j],
          aroundMines = square.prop("aroundMines")
        //如果周围没有雷 或者 本身是雷 就跳过不写
        if (aroundMines === 0 || square.prop("isMine")) {
          continue
        }
        square
          .css("color", fontColor[aroundMines] + "")
          // 写到第一个 span 中
          .children("span:first")
          .text(aroundMines + "")
      }
    }
  }

  // 添加事件函数
  function addEvent(restartFlag = false) {
    let curDifficult = difficulties[nowLevel]
    //给游戏区域的方块添加事件代理
    // 这里有个坑
    // 事件绑定应该为 mousedown 才能检测鼠标右键
    $(".gameArea").on("mousedown", "div", (e = window.event) => {
      play(e)
      return false
    })

    //禁用游戏区域的右键菜单
    // bind 绑定事件
    // contextmenu方法 单击右键触发 contextmenu 事件
    // 做WEB前端开发的人都知道不同的浏览器对事件的处理方式是有区别的
    // 比如得到触发事件的元素引用在IE浏览器下是：event.srcElement
    // 在FF浏览器下则是：event.target，
    // 另外又比如在FF浏览器下得到光标相对页面的位置是event.pageX
    // 而IE浏览器下的处理方式又是不一样的
    // 当然还有一些像“阻止事件冒泡”以及“取消浏览器默认行为”等
    // 不同浏览器也有不同的处理方式，
    // 如果我们要使JavaScript在不同的浏览器下能正常处理事件代码，就要分别进行判断处理。
    // 现在jQuery为我们提供了统一兼容处理函数$.event.fix(e)
    $(".gameArea").bind("contextmenu", (event) => {
      var e = $.event.fix(event)
      e.preventDefault()
      return false
    })

    // 如果是因为更换游戏难度 则只需要渲染gameArea 其他事件则无需重新添加
    // 否则会出现错误
    if (restartFlag) {
      return
    }
    // 回调函数
    //重新开始游戏
    $(".smile").on("click", function () {
      restart()
    })

    // 暂停游戏
    $(".pause").on("click", function () {
      pauseGame(curDifficult)
    })

    // 选项
    //选项按钮
    $(".option").on("click", function () {
      //选项卡展开和收起
      $(this)
        .find(".sub-option")
        .slideToggle(300)
    })

    // 主页访问

    // 初级、中级和高级难度选择
    // jQuery :lt=>Select all elements at an index less than index within the matched set.
    $(".item:lt(3)").on("click", function () {
      $(this)
        .siblings()
        // 先将原有的class删除
        .removeClass("item-click-bg")
      // 为选中的元素添加class 背景颜色
      $(this).addClass("item-click-bg")
      // console.log($(this).index())
      // 并重新调用棋盘设置函数
      nowLevel = $(this).index()
      restart()
      $(this)
        .parent()
        .slideToggle(300) //选项卡收起
      return false // 防止冒泡到option上
    })

    // 界面设置
    // toggleClass:Add or remove one or more classes from each element in the set of matched elements,
    // depending on either the class's presence or the value of the state argument.
    $(".item")
      .eq(3)
      .on("click", function () {
        //界面设置按钮
        $(this)
          .children(".themeSettings")
          .toggleClass("themeSettings-show")

        return false //阻止冒泡到option按钮上
      })

    //界面设置下面的两个主题添加点击事件
    $(".greyTheme span:last").on("click", function () {
      sessionStorage.setItem("gameStyle", "greyStyle");
      $(".square")
        .find("span:last")
        .attr("class", "greyStyle")
    })
    $(".blueTheme span:last").on("click", function () {
      sessionStorage.setItem("gameStyle", "blueStyle");
      $(".square")
        .find("span:last")
        .attr("class", "blueStyle")
    })
    $(".greenTheme span:last").on("click", function () {
      sessionStorage.setItem("gameStyle", "greenStyle");
      $(".square")
        .find("span:last")
        .attr("class", "greenStyle")
    })
  }

  // 两种方式判断游戏是否通关
  // 一是如果有小红旗的标记 且个数等于雷的个数 则OK
  // 二是如果剩余方块数等于雷数 则OK
  function checkPass(flagMark) {
    // flagMark 是 小红旗的标记位
    // 如果小红旗标志个数等于雷数 则为true
    let isWin = true
    if (flagMark) {
      $.each(minesPosSet, (index, value) => {
        let [r, c] = [value.row, value.col]
        if (!squareArr[r][c].prop("isMarked")) {
          // 如果某雷还存在没有被标记小红旗的地方
          isWin = false
          return false
        }
      })
      // 需要注意的是 并不是说仅凭借flagMark为true就决定输赢
      // 当且仅当你将所有雷区都标记了小红旗才算成功
      // 否则游戏继续
      if (isWin) {
        gameOver(isWin)
      }
    } else {
      // 或者通过剩余方块数和雷数是否相等来判断
      if (surplusSquareNum === difficulties[nowLevel].mineNum) {
        gameOver(true)
      }
    }
  }

  function gameOver(isWin) {
    clearInterval(timer)
    // 游戏结束的提示mask
    let mask = $('<div class="gameOver-mask"></div>')
    mask.css({
      width: difficulties[nowLevel].wNum * squareSize + "px",
      height: difficulties[nowLevel].hNum * squareSize + "px",
      lineHeight: difficulties[nowLevel].hNum * squareSize + "px"
    })

    if (isWin) {
      // 如何换行标签?
      let tag = "<span>用时: " + $(".time-num").text() + "</span>"
      mask.append(tag)
    } else {
      mask.append("<span>失败!</span>")
    }

    $(".gameArea").append(mask)

    // 显示出有雷的位置
    // 也即是清除squareArr的第二个span
    $.each(minesPosSet, function (index, value) {
      squareArr[value.row][value.col]
        .children(":last")
        .slideUp(500, function () {
          $(this).remove()
        })
    })
  }

  //重新开始游戏
  // question: 在使用嵌套 setTimeOut的时候 时间出现错误
  // console 显示 timer未被清除
  // setInterVal 则表现正常 why?
  function restart() {
    //重置变量
    squareArr = []
    minesPosSet = {}
    spaceSet = {}
    openedSet = {}
    surplusSquareNum = 0 //当前剩余未翻开的方块的数目
    currentMineNum = 0 //当前剩余的雷的数目
    timeStr = "00:00:00"
    //重置界面
    $(".gameArea").remove() //移除原来的游戏区域
    $(".container").append('<div class="gameArea"></div>') //重新添加游戏区域
    // 重新初始化
    // 不能init 因为重复添加addEvent会导致出错
    // 当然可以给addEvent传一个标志位参数
    addEvent(true)
    layoutBoard(difficulties[nowLevel])
    gameTiming(timeStr)
  }

  // 鼠标的点击事件
  function play(e) {
    // 包装为jQuery对象
    // 如果事件源是小红旗 由于小红旗是append的子元素i
    // 则取其父元素span
    const target = $(e.target).hasClass("mark-flag") ? $(e.target).parent() : $(e.target);
    // 取得 square对象
    let square = target.parent(),
      state = square.prop("state"),
      mouseKey = e.button;
    //鼠标按键 0:左键 2:右键
    //state: -1 | 0 | 1 | 2 ,依次代表：已翻开 | 原始未翻开 | 标记旗子 | 标记问号
    // 鼠标左键能点击的条件
    if (mouseKey === 0 && (state === 0 || state === 2)) {
      square.prop("state", -1)
      // 第二个span消失
      target.fadeOut(300)
      // 剩余方块-1
      surplusSquareNum--
      // 加入已打开的方块集合
      openedSet[square.prop("row") + "*" + square.prop("col")] = 1
      // 如果点到了炸弹
      if (square.prop("isMine")) {
        // 点击的雷那里加一个红色面罩
        // 由于gameOver的处理逻辑是取其最后一个孩子span消除
        // 因此面罩应该加在前面
        square.prepend($("<span class=click-mine-mask></span>"))
        gameOver(false)
        // return false的作用?
        return false
      }
      //如果当前点击的方块的周围雷数为0，即为空白块
      // 就检查是否可以扩散
      if (square.prop("aroundMines") === 0) {
        // 由于spreadSquare会处理剩余雷数
        // 这里将剩余方块+1 恢复原状
        surplusSquareNum++
        spreadBlankSquare(square, spaceSet)
      }
      // 检查是否通关
      checkPass(false)
    } else if (mouseKey === 2 && state != -1) {
      // 如果点击鼠标右键
      // 根据state处理不同事件
      switch (state) {
        case 0:
          // 标记小红旗
          target.append("<span class='mark-flag'></span>")
          // 标记位
          square.prop("isMarked", true)
          // 剩余雷数目-1
          $(".mine-num").text(--currentMineNum + "")
          // 如果标记了雷数目的红旗
          // 则执行标记完后的确认检查
          if (currentMineNum === 0) {
            checkPass(true)
          }
          break
        case 1:
          // 标记问号
          target.text("?")
          // 取消标记
          square.prop("isMarked", false)
          // 剩余雷数目+1
          $(".mine-num").text(++currentMineNum + "")
          break
        case 2:
          target.text("")
          break
      }
      // 点击一次 state+1
      // 注意循环
      square.prop("state", ++state % 3)
    }

  }

  function spreadBlankSquare(square, spaceSet) {
    // 扩散空白块
    // 并设一个空白块集合 方便递归调用
    // console.log(square.prop("row"))
    let [r, c] = [square.prop("row"), square.prop("col")],
    // spaceSet = spaceSet || {},
    k = r + "*" + c
    // 剩余方块数-1
    surplusSquareNum--
    // 加入到已打开的方块集合中
    openedSet[k] = 1
    // 加入到空白块集合
    spaceSet[k] = {
      row: r,
      col: c
    }
    // 遍历周围的方块
    for (let i = r - 1; i <= r + 1; i++) {
      for (let j = c - 1; j <= c + 1; j++) {
        // 超过边界
        if (
          i <= 0 ||
          j <= 0 ||
          i >= difficulties[nowLevel].hNum ||
          j >= difficulties[nowLevel].wNum
        ) {
          continue
        }
        //循环到当前这个空白格子 或者 当前循环到的已经加入了spaceSet
        if ((i === r && j === c) || spaceSet[i + "*" + j] !== undefined) {
          continue
        }
        // 否则就翻开方块
        // 如果方块后为数字 则翻开遮罩
        // 如果同样为空白块 则递归调用
        if (squareArr[i][j].prop("aroundMines") > 0) {
          if (openedSet[i + "*" + j] != 1) {
            // 第一次被翻开
            squareArr[i][j].children(":last").fadeOut(200)
            openedSet[i + "*" + j] = 1
            surplusSquareNum--
          }
        } else if (squareArr[i][j].prop("aroundMines") === 0) {
          //如果squareArr[i][j]也是空白格，递归继续查找空白格子
          //覆盖在方块上的span消失
          squareArr[i][j].children(":last").fadeOut(200)
          spreadBlankSquare(squareArr[i][j], spaceSet)
        }
      }
    }
  }

  // 暂停游戏
  // 原生js弹出框太丑 后续用jQuery.ui去改进
  function pauseGame(attr) {
    // 将暂停的时间保存在 sessionStorage 内
    sessionStorage.setItem("pause-time", $(".time-num").text());
    clearInterval(timer);
    // jquery ui替换原始确认框
    if (confirm("点击确定继续，取消重开！")) {
      gameTiming(sessionStorage.getItem("pause-time"));
    } else {
      restart();
    }
  }


  // 利用map和隐式转换实现一个string2int
  // 将 "00:02:03" => "[0, 2, 3]"
  function string2int(str) {
    return str.split(":").map(x => x * 1)
  }

  function gameTiming(timeStr) {
    //  清除原有计时器
    if (timer !== null) {
      clearInterval(timer)
    }

    let [hours, minutes, seconds] = string2int(timeStr)

    // 使用嵌套的 setTimeout 来代替 setInterval出错
    timer = setInterval(function fn() {
      seconds++
      if (seconds === 60) {
        seconds = 0
        minutes++
      }
      if (minutes === 60) {
        minutes = 0
        hours++
      }
      if (hours > 1) {
        console.log('You need a fresh air...');
      }
      timeStr =
        (hours < 10 ? "0" + hours : hours) +
        ":" +
        (minutes < 10 ? "0" + minutes : minutes) +
        ":" +
        (seconds < 10 ? "0" + seconds : seconds)
      $(".time-num").text(timeStr)
    }, 1000)
  }

  function init() {
    layoutBoard(difficulties[nowLevel]) //初始化网络，9x9网格
    addEvent() //添加事件
    gameTiming(timeStr) //开始计时
  }

  init()
})(jQuery, window)