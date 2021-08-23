// This file is automatically compiled by Webpack, along with any other files
// present in this directory. You're encouraged to place your actual application logic in
// a relevant structure within app/javascript and only use these pack files to reference
// that code so it'll be compiled.

import Rails from "@rails/ujs"
import Turbolinks from "turbolinks"
import * as ActiveStorage from "@rails/activestorage"
import "channels"
import roomChannel from '../channels/room_channel'

Rails.start()
Turbolinks.start()
ActiveStorage.start()


document.addEventListener('DOMContentLoaded', (event) => {
    var calls = document.getElementsByClassName('call-button')
    for ( let call of calls ) {
       console.log ('Call: ', call)
       call.addEventListener('click', (e) => {
          e.preventDefault();
          let recipient_id = call.getAttribute('data-id')
          let recipient_name = call.getAttribute('data-username')
          document.getElementById('recipient_name').innerHTML =   recipient_name
          document.getElementById('sender-notif').classList.toggle('d-none')
          roomChannel.call(recipient_id)
       })
    }

    var answer_btn = document.getElementById('answer-call')
    answer_btn.addEventListener('click', event => {
    event.preventDefault()
    let session_id = document.getElementById('session_id').textContent
    let sender_id = document.getElementById('sender_id').textContent
    document.getElementById('receiver-notif').classList.toggle('d-none')
    roomChannel.answer( session_id, sender_id )
    })
 })