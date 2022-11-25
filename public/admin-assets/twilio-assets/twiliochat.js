var twiliochat = (function() {
    var tc = {};
    var MESSAGES_HISTORY_LIMIT = 1000;
  
    var $identity;
    var $channelList;
    var $inputText;
    var $typingRow;
    var $typingPlaceholder;
    var $sendMsgBtn;
    var channelArr = [];
  
    $(document).ready(function() {
      tc.init();
    });
  
    tc.init = function() {
      tc.$messageList = $('#message-list');
      $channelList = $('#channel-list');
      $inputText = $('#input-text');
      $typingRow = $('#typing-row');
      $typingPlaceholder = $('#typing-placeholder');
      $sendMsgBtn = $("#sendMsgBtn")
      $inputText.on('keypress', handleInputTextKeypress);
      $sendMsgBtn.on('click', handleInputTextClickBtn);

      fetchAccessToken(connectMessagingClient);

      $(document).off().on("click", "#channel-list .chat_list", function(e){
        let selectedChannel = $(this).data("sid");
        if (tc.currentChannel && selectedChannel === tc.currentChannel.sid) {
          return;
        }
        setupChannel(selectedChannel);
      });
    };

    function fetchAccessToken(handler) {
        $.post('/admin/chats/get-service-token', {}, null, 'json')
        .done(function(response) {
            $identity = response.identity;
            handler(response.token);
        })
        .fail(function(error) {
            alert("Failed to fetch the Access Token");
            console.log('Failed to fetch the Access Token with error: ' + error);
        });
    }
    
    async function connectMessagingClient(token) {
        // Initialize the Chat messaging client
        let client = await Twilio.Conversations.Client.create(token);
        tc.messagingClient = client;
        tc.loadChannelList();
        tc.messagingClient.on('messageAdded', $.throttle(tc.loadChannelList));
        tc.messagingClient.on('channelAdded', $.throttle(tc.loadChannelList));
        tc.messagingClient.on('tokenExpired', refreshToken);
    }
  
    function refreshToken() {
        fetchAccessToken(setNewToken);
    }
  
    function setNewToken(token) {
        tc.messagingClient.updateToken(token);
    }
    
    tc.loadChannelList = function(handler) {
        if (tc.messagingClient === undefined) {
            alert("Chat client is not initialized");
            console.log('Client is not initialized');
            return;
        }
        tc.messagingClient.getSubscribedConversations().then(function(channels) {
            tc.channelArray = tc.sortChannelByMsgDate(channels.items);
            if(tc.channelArray.length > 0){
              addChannel(tc.channelArray).then(function(){
                $channelList.text('');
                channelArr.forEach(function(item){
                  $channelList.append(item);
                });
              });
            } else {
              $channelList.html('<h3 class="p-3">No conversation found.</h3>');
            }
            /*if (typeof handler === 'function') {
                handler();
            }*/
        });
    }

    tc.sortChannelByMsgDate = function(channels){
      return channels.sort(function(a, b) {
        /** Sort based on the last message if not, consider the last update of the channel */
        return new Date(b.lastMessage ? b.lastMessage.dateCreated : b.dateUpdated) - new Date(a.lastMessage ? a.lastMessage.dateCreated : a.dateCreated);
      });
    }

    async function channelHtml(channel){
      let unreadMsgCount = 0;
      if(channel.lastMessage){
        try {
          unreadMsgCount = await channel.getUnreadMessagesCount();
        } catch {
          // nothing to do there...
        }
      }
      let msgBadgeClass = "";
      if(unreadMsgCount == 0){
        msgBadgeClass = "d-none";
      }
      let activeChatClass = "", chatDate;
      if (tc.currentChannel && channel.sid === tc.currentChannel.sid) {
        activeChatClass = "active_chat";
      }
      chatDate = moment(channel.lastMessage ? channel.lastMessage.dateCreated : channel.dateUpdated).format("LLL");
      let html = `<a href="javascript:void(0)" class="chat_list list-group-item list-group-item-action border-0 `+activeChatClass+`" data-sid=`+channel.sid+`>
                    <div class="badge bg-success float-end `+msgBadgeClass+`">`+unreadMsgCount+`</div>
                    <div class="d-flex align-items-start">
                        <img src="/admin-assets/images/proImg.png" class="rounded-circle me-1" alt="`+channel.friendlyName+`" width="40" height="40">
                        <div class="flex-grow-1 ms-3">
                            `+channel.friendlyName+`
                            <div class="small">`+chatDate+`</div>
                        </div>
                    </div>
                  </a>`;
      return html;
    }
  
    async function addChannel(channels, index=0) {
        channelArr[index] = await channelHtml(channels[index]);
        index++;
        return channels.length > index ? addChannel(channels, index) : "";
    }

    function setupChannel(channel) {
      showLoader();
      return leaveCurrentChannel()
        .then(function() {
          return initChannel(channel);
        })
        .then(function(_channel) {
          return joinChannel(_channel);
        })
        .then(initChannelEvents);
    }

    function leaveCurrentChannel() {
      if (tc.currentChannel) {
        tc.currentChannel.removeListener('messageAdded', tc.addMessageToList);
        tc.currentChannel.removeListener('typingStarted', showTypingStarted);
        tc.currentChannel.removeListener('typingEnded', hideTypingStarted);
        return Promise.resolve();
        /*return tc.currentChannel.leave().then(function(leftChannel) {
          console.log('left ' + leftChannel.friendlyName);
          leftChannel.removeListener('messageAdded', tc.addMessageToList);
          leftChannel.removeListener('typingStarted', showTypingStarted);
          leftChannel.removeListener('typingEnded', hideTypingStarted);
        });*/
      } else {
        return Promise.resolve();
      }
    }

    function initChannel(channelSid) {
      console.log('Initialized channel ' + channelSid);
      return tc.messagingClient.getConversationBySid(channelSid);
    }
  
    function joinChannel(_channel) {
      return _channel.join()
        .then(function(joinedChannel) {
          console.log('Joined channel ' + joinedChannel.friendlyName);
          updateChannelUI(_channel);
          
          return joinedChannel;
        })
        .catch(function(err) {
          if (_channel.status == 'joined') {
            updateChannelUI(_channel);
            return _channel;    
          } 
          console.error(
            "Couldn't join channel " + _channel.friendlyName + ' because -> ' + err
          );
        });
    }

    function updateChannelUI(selectedChannel) {
      $("#channel-list .active_chat").removeClass("active_chat");
      $("#channel-list .chat_list[data-sid="+selectedChannel.sid+"]").addClass("active_chat");
      tc.currentChannel = selectedChannel;
      $("#userNameChatHead").show();
      $("#userName").text(selectedChannel.friendlyName);
      tc.$messageList.text('');
      $typingRow.hide();
      tc.loadMessages();
    }
  
    function initChannelEvents() {
      console.log(tc.currentChannel.friendlyName + ' ready.');
      tc.currentChannel.on('messageAdded', tc.addMessageToList);
      tc.currentChannel.on('typingStarted', showTypingStarted);
      tc.currentChannel.on('typingEnded', hideTypingStarted);
      $inputText.prop('disabled', false).focus();
    }

    tc.loadMessages = function() {
      tc.currentChannel.getMessages(MESSAGES_HISTORY_LIMIT).then(function (messages) {
        messages.items.forEach(tc.addMessageToList);
        
        // show unread messages
        let newestMessageIndex = messages.items.length ? messages.items[messages.items.length - 1].index : 0;
        //let lastIndex = tc.currentChannel.lastConsumedMessageIndex;
        /*if (lastIndex && lastIndex !== newestMessageIndex) {
          let $divIndex = $('div[data-index='+ lastIndex + ']');
          let top = $divIndex.position() && $divIndex.position().top;
          $divIndex.addClass('last-read');
          tc.$messageList.scrollTop(top + tc.$messageList.scrollTop());
        }*/
        tc.currentChannel.updateLastReadMessageIndex(newestMessageIndex).then(readAllMsgOfChannelUI);

      });
      hideLoader();
      $typingRow.show();
    };

    function msgHtml(msg){
      let otherUser = $("#userName").text();
      let chatDate, html;
      chatDate = moment(msg.dateCreated).format("LLL");
      if($identity == msg.author){
        html = `  
                <div class="chat-message-right pb-4">
                    <div>
                        <img src="/admin-assets/images/proImg.png" class="rounded-circle me-1" alt="Me" width="40" height="40">
                    </div>
                    <div class="flex-shrink-1 bg-light rounded py-2 px-3 me-3">
                        <div class="font-weight-bold mb-1">You</div>
                        `+msg.body+`
                        <div class="text-muted small text-nowrap mt-2">`+chatDate+`</div>
                    </div>
                </div>`;
      } else {
        html = `
                <div class="chat-message-left pb-4" data-index="`+msg.index+`">
                    <div>
                        <img src="/admin-assets/images/proImg.png" class="rounded-circle me-1" alt="..." width="40" height="40">
                    </div>
                    <div class="flex-shrink-1 bg-light rounded py-2 px-3 ms-3">
                        <div class="font-weight-bold mb-1">`+otherUser+`</div>
                        `+msg.body+`
                        <div class="text-muted small text-nowrap mt-2">`+chatDate+`</div>
                    </div>
                </div>`;
      }
      return html;
    }

    tc.addMessageToList = function(message) {
      if(message.index > message.conversation.lastConsumedMessageIndex){
        message.conversation.updateLastConsumedMessageIndex(message.index);
      }
      var rowDiv = msgHtml(message);
  
      tc.$messageList.append(rowDiv);
      scrollToMessageListBottom();
    };
  
    function handleInputTextKeypress(event) {
      if (event.keyCode === 13) {
        tc.currentChannel.sendMessage($(this).val());
        event.preventDefault();
        $(this).val('');
      }
      else {
        notifyTyping();
      }
    }

    function handleInputTextClickBtn(event) {
       event.preventDefault();
       tc.currentChannel.sendMessage($inputText.val());
       $inputText.val('');
    }
  
    var notifyTyping = $.throttle(function() {
      tc.currentChannel.typing();
    }, 1000);
  
    function showTypingStarted(member) {
      //member.identity
      $typingPlaceholder.text('typing...');
    }
  
    function hideTypingStarted(member) {
      $typingPlaceholder.text('');
    }
  
    function scrollToMessageListBottom() {
      tc.$messageList.scrollTop(tc.$messageList[0].scrollHeight);
    }

    function readAllMsgOfChannelUI(){
      let channelId = tc.currentChannel.sid;
      $("[data-sid="+channelId+"]").find(".badge").hide();
    }
  
    return tc;
  })();