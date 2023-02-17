const socket = io()

/*Elements */
const $messageForm = document.querySelector('#message-form')
const $messageFormInput = $messageForm.querySelector('input')
const $messageFormButton = $messageForm.querySelector('button')
const $sendLocation = document.querySelector('#send-location')
const $messages = document.querySelector('#messages')

/*Templates */
const messageTemplate = document.querySelector('#message-template').innerHTML 
const locationMessageTemplate = document.querySelector('#location-message-template').innerHTML
const sidebarTemplate = document.querySelector('#sidebar-template').innerHTML

/*Options */
const {username,room} = Qs.parse(location.search,{ignoreQueryPrefix:true})

const autoScroll = ()=>{
    /*New message element */
    const $newMessage = $messages.lastElementChild

    /*Height of the new messages */
    const newMessageStyle = getComputedStyle($newMessage) // available by the web browser
    const newMessageMargin = parseInt(newMessageStyle.marginBottom)
    const newMessageHeight = $newMessage.offsetHeight + newMessageMargin

    /*Visible height */
    const visibleHeight = $messages.offsetHeight

    /*Height of messages container*/
    const containerHeight = $messages.scrollHeight

    /*How far have I scroll */
    const scrollOffset = $messages.scrollTop + visibleHeight
    
    if (containerHeight - newMessageHeight <= scrollOffset) {
    $messages.scrollTop = $messages.scrollHeight
    }


}


socket.on('message',(message)=>{   // listens to the event io.emit'i çağırdık burada
    console.log(message)
    const html = Mustache.render(messageTemplate, {
        username: message.username,
        message: message.text,
        createdAt: moment(message.createdAt).format('DD MMMM / HH:mm')
    })
    $messages.insertAdjacentHTML('beforeend', html)
    autoScroll()
})

socket.on('sendMessage',(chat)=>{
    console.log(chat)
})

socket.on('locationMessage',(msg)=>{
    console.log(msg)
    const html = Mustache.render(locationMessageTemplate,{
        username: msg.username,
        url : msg.url,
        createdAt : moment(msg.createdAt).format('DD MMMM / HH:mm')
    })
    $messages.insertAdjacentHTML('beforeend',html)
    autoScroll()
})

socket.on('roomData', ({ room, users }) => {
    const html = Mustache.render(sidebarTemplate, {
    room,
    users
    })
    document.querySelector('#sidebar').innerHTML = html
   })

$messageForm.addEventListener('submit', (e) => {
    e.preventDefault()

    /*Button disabled cause we want it to work once till callback from server */
    $messageFormButton.setAttribute('disabled','disabled')


    const message = e.target.elements.message.value

    socket.emit('sendMessage', message , (err) =>{
        
        /*Button enabled cause server send response function */
        $messageFormButton.removeAttribute('disabled')  
        $messageFormInput.value = ''  // İnputu temizler
        $messageFormInput.focus()  // Submit yaptıktan sonra focusu inputa getirir

        if(err){
            return console.log(err)
        }
        console.log('Message delivered!')
    })
})
$sendLocation.addEventListener('click',(e)=>{
    e.preventDefault()
    /*Button disabled cause we want it to work once till callback from server */
    $sendLocation.setAttribute('disabled','disabled')

    if(!navigator.geolocation){
        return alert('Geolocation is not supported by your browser')
    }
    
    navigator.geolocation.getCurrentPosition((position)=>{
        socket.emit('sendLocation',{
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
        },()=>{

            $sendLocation.removeAttribute('disabled')

            console.log('Location shared correctly.')
        })
    })
    
})

socket.emit('join',{username,room}, (error)=>{
    if(error){
        alert(error)
        location.href = '/'
    }
})