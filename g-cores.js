// Copyright (c) 2016 Catbaron. All rights reserved.

url_gcores = "http://www.g-cores.com";
url_check_msg = url_gcores+'/setting/notifications?ajax=1';
url_notifications = url_gcores+"/setting/notifications";
url_inbox = url_gcores+"/inbox";

var notification_size = mail_size = 0;

// Return the URL used for ajax checking notifications
function getUrlNotificationsAjax(){
  return url_check_msg;
}

// Return the URL of the notification page
function getUrlNotificationsPage(){
  if(mail_size != 0){
    // if there is a direct message, go to page of inbox
    return url_inbox;
  }
  else if(notification_size != 0){
    // otherwise go to the page of notifications
    return url_notifications;
  }
  else{
    return url_gcores;
  }
}

// Check if any new message
function checkMSG(url, callback){
  var xhr = new XMLHttpRequest();
  xhr.open("GET", url, true);
  xhr.setRequestHeader("X-Requested-With","XMLHttpRequest");
  // Needed, otherwise the response will be html instead of json data.
  xhr.setRequestHeader("Accept","application/json, text/javascript, */*; q=0.01");

  xhr.onreadystatechange = function(){
    if(xhr.readyState == 4){
      callback(xhr, true);
    }
  }
  xhr.onerror = function(){
    callback(xhr, false);
  }
  xhr.send();
}
function callback(xhr, success){
  msg_number = "0";
  if(success){
    // The user is login, update the alert on the button
    try{
      msg = JSON.parse(xhr.responseText);
      mail_size = msg.mails_size;
      notification_size = msg.notifications_size;
      msg_number = mail_size + notification_size;
      if(parseInt(msg_number)>99){
        // If there're too many messages, show as 99+
        msg_number = "99+";
      }
      else{
        // otherwise show the number of the message
        msg_number = msg_number == 0? "" : msg_number.toString()
      }
    } catch (e) {
      // The response is not Json data
      // This condition may be caused by the fact that the user didn't login,
      // or the request if failed, or the URL is wrong.
      msg_number = "?";
    }
  }
  else{
    // Request failed
    msg_number = "?";
  }
  chrome.browserAction.setBadgeBackgroundColor({color: '#0000FF'});
  chrome.browserAction.setBadgeText({text: msg_number});
}

// Click the button and jump to the notification page.
// The page will rederict to login page if the user is not login
// chrome.browserAction.onClicked.addListener(function(){
//   chrome.tabs.create({url: getUrlNotificationsPage()});
// });

// Receive the request message from the popup page
chrome.runtime.onMessage.addListener(function(message, sender, sendResponse){
  if(message == 'NumberOfNotification'){
    // Request for the number of notifications
    sendResponse(notification_size);
  }
});

setInterval(function(){
  checkMSG(getUrlNotificationsAjax(), callback)
}, 5000)
