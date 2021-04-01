// Line
var token = 'U6vrF5viwWpiMrSf8VF3xh0E42BVmQJ2dXLEv9h3IsOvKXo/8zec+QWQzihNCc9XvNu2DCf3gzFLXedBdCmcPMhS60+ZRNZLz7ZpUYdNftppMTP8U8SHY/yKL5Knz4F1TU5Ef/fSCIfrO+O5a8YpPwdB04t89/1O/w1cDnyilFU=';

//Google Sheet
var SpreadSheet = SpreadsheetApp.openById("1-eoz4V5tjTH2APBa-rNvwxam32hpaSzMDt8_B60MX70");

function doPost(e) {
  e = e || {
    isTest: true,
    postData: {
      contents: {
        events: [
          {
            source: {
              userId: '測試用'
            },
            replyToken: '9898998887',
            message:
            {
              "type": "text",
              "text": "新北市"
            }
          },
          {
            source: {
              userId: '測試用2'
            },
            replyToken: '9898998888',
            message:
            {
              "type": "text",
              "text": "什麼東西？"
            }
          },
          {
            source: {
              userId: '測試用3'
            },
            replyToken: '9898998889',
            message:
            {
              "type": "text",
              "text": "蛤？"
            }
          },
          {
            source: {
              groupId: '測試用群組'
            },
            replyToken: '989899888887',
            message:
            {
              "type": "sticker",
              "packageId": '1412485',
              "stickerId": '15877696'
            }
          }
        ]
      }
    }
  }
  try {
    var message = e.postData.contents;
    typeof message !== 'object' && (message = JSON.parse(message))

    message.events.forEach((event, index) => {
      writeMsgInSheet(event, index)
      if (event.message.type !== 'text') return
      var replyToken = event.replyToken
      var city = event.message.text
      var isCityName = getCityName(city) !== '不是正確的名稱'
      var msg = ''
      if (isCityName || isFoolDay()) {
        // 愚人節代碼
        if (isFoolDay()) {
          if (isCityName) msg = getFoolDaydata().data
          if (answerFoolDay(event.message.text)) msg = getFoolDaydata().reply+ '\n\n' +getWeatherData('新北市')
          msg && replyLineMsg(replyToken, msg, e)
          return
        }
        replyLineMsg(replyToken, getWeatherData(city), e)
      }
    })
  } catch (error) {
    console.log(error)
    if (!e.isTest) writeErrorInSheet(error)
  }
}

function writeMsgInSheet(event, index) {
  var Sheet = SpreadSheet.getSheetByName("GetMsg");
  var LastRow = Sheet.getLastRow();

  var replyToken = event.replyToken
  var source = event.source
  var message = event.message
  var timestamp = (event.timestamp && Date.parse(event.timestamp)) || new Date()
  Sheet.getRange(LastRow + 1, 1).setValue(replyToken);
  Sheet.getRange(LastRow + 1, 2).setValue(source.type);
  Sheet.getRange(LastRow + 1, 3).setValue(source.userId || source.groupId || source.roomId || '');
  Sheet.getRange(LastRow + 1, 4).setValue(index);
  Sheet.getRange(LastRow + 1, 5).setValue(message.type);
  Sheet.getRange(LastRow + 1, 6).setValue(message.text || '');
  Sheet.getRange(LastRow + 1, 7).setValue(message.packageId || '');
  Sheet.getRange(LastRow + 1, 8).setValue(message.stickerId || '');
  Sheet.getRange(LastRow + 1, 9).setValue(Utilities.formatDate(timestamp, "GMT+8", "MM-dd-yyyy HH:mm:ss"));
}

function writeBotMsgInSheet(reply) {
  var Sheet = SpreadSheet.getSheetByName("SendMsg");
  var LastRow = Sheet.getLastRow();

  var targetID = reply.targetID
  var replyToken = reply.replyToken
  var messages = reply.messages
  messages.forEach((message, index) => {
    console.log(message)
    Sheet.getRange(LastRow + 1, 1).setValue(replyToken);
    Sheet.getRange(LastRow + 1, 2).setValue(targetID);
    Sheet.getRange(LastRow + 1, 3).setValue(index);
    Sheet.getRange(LastRow + 1, 4).setValue(message.type);
    Sheet.getRange(LastRow + 1, 5).setValue(message.text || '');
    Sheet.getRange(LastRow + 1, 6).setValue(message.packageId || '');
    Sheet.getRange(LastRow + 1, 7).setValue(message.stickerId || '');
    Sheet.getRange(LastRow + 1, 8).setValue(Utilities.formatDate(new Date(), "GMT+8", "MM-dd-yyyy HH:mm:ss"));
  })
}

function writeErrorInSheet(error) {
  var Sheet = SpreadSheet.getSheetByName("Error");
  var LastRow = Sheet.getLastRow();

  Sheet.getRange(LastRow + 1, 1).setValue(error);
  Sheet.getRange(LastRow + 1, 2).setValue(Utilities.formatDate(new Date(), "GMT+8", "MM-dd-yyyy HH:mm:ss"));
}

function getCityName(text) {
  text = text || ''
  text = text.replace('台', '臺')
  text = (text.includes('市') || text.includes('縣')) && text.length === 3 ? text : '不是正確的名稱'
  return text
}

function isFoolDay() {
  var date = new Date()
  return date.getMonth() + 1 === 4 && date.getDate() === 1
}

function answerFoolDay(text) {
  text = text || ''
  var keyWordList = [
    '什麼東西', '什麼鬼', '搞什麼', '笑死', '???', '好鬧', '好酷', '白痴', '真的', '假的'
  ]
  return keyWordList.find(keyword => text.includes(keyword))
}

function getFoolDaydata() {
  var data = [
    [
      '天氣現象: 跟你的人生一樣 超大陣雨',
      '降雨機率: 跟你的告白被拒絕的機率一樣 150 %',
      '最低溫度: 跟你的薪水一樣 沒有最低',
      '舒適度: 跟我對你的感覺一樣 不舒適',
      '最高溫度: 跟你要繳出去的錢一樣 沒有上限'
    ], [
      '天氣現象: 跟暈船的人心情一樣 晴時多雲偶陣雨',
      '降雨機率: 跟曖昧的成功率一樣 50 %',
      '最低溫度: 跟曖昧中的對象一樣 忽冷忽熱',
      '舒適度: 跟曖昧中的感覺一樣 痛並快樂著',
      '最高溫度: 我不是說了曖昧就是 忽冷忽熱'
    ],
    [
      '天氣現象: 跟即將放假的我一樣 超級大晴天',
      '降雨機率: 跟放假中鬧鐘叫醒我的機率一樣 0 %',
      '最低溫度: 跟青春年華中的我一樣 23˚C',
      '舒適度: 跟耍廢打混中的我一樣 超級爽der',
      '最高溫度: 跟不會踏出冷氣房的我一樣 20˚C'
    ]
  ]
  return {
    "data": data[Math.floor(Math.random() * 3)].join('\n'),
    "reply": "騙你的！愚人節快樂呵呵"
  }
}

function getWeatherData(city) {
  var response = UrlFetchApp.fetch('https://opendata.cwb.gov.tw/api/v1/rest/datastore/F-C0032-001?Authorization=CWB-0561DB8F-7B16-4FBE-B3E1-4AF27A5353FB', {
    method: 'GET'
  })
  var data = JSON.parse(response.getContentText());

  var reportArray = {
    Wx: {
      name: "天氣現象",
      unit: ""
    },
    PoP: {
      name: "降雨機率",
      unit: "%"
    },
    MaxT: {
      name: "最高溫度",
      unit: "˚C"
    },
    MinT: {
      name: "最低溫度",
      unit: "˚C"
    },
    CI: {
      name: "舒適度",
      unit: ""
    }
  }

  var locationList = data.records.location.find(local => {
    return local.locationName === city
  })
  var weatherElement = locationList && locationList.weatherElement

  var msg = ''
  if (weatherElement) {
    var latestData = weatherElement.filter(el => {
      el.time = el.time.find(timeData => {
        return new Date() <= new Date(timeData.startTime)
      })
      return el
    })
    msg = latestData.map(data => {
      return reportArray[data.elementName].name + ': ' + data.time.parameter.parameterName +
        ' ' + (reportArray[data.elementName].unit || '')
    }).join('\n')
  }

  return weatherElement ? msg : '查無此縣市'


}

function replyLineMsg(replyToken, msg, e) {
  var result = {
    replyToken: replyToken,
    targetID: 'TinyWeatherBot',
    messages: []
  }

  if (typeof msg === 'object') {
    msg.forEach(m => {
      result.messages.push({
        "type": m.type,
        "text": m.text
      })
    })
  } else {
    result.messages.push({
      "type": "text",
      "text": msg
    })
  }

  var option = {
    method: 'post',
    headers: { Authorization: 'Bearer ' + token },
    contentType: 'application/json',
    payload: JSON.stringify(result)
  };

  writeBotMsgInSheet(result)

  if (!e.isTest) UrlFetchApp.fetch('https://api.line.me/v2/bot/message/reply', option);
}